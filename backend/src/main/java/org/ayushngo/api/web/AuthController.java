package org.ayushngo.api.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.ayushngo.api.config.CsrfConfiguration;
import org.ayushngo.api.dto.ApiDtos;
import org.ayushngo.api.model.UserAccount;
import org.ayushngo.api.repository.UserAccountRepository;
import org.ayushngo.api.service.ApiException;
import org.ayushngo.api.service.CurrentAccountService;
import org.ayushngo.api.service.RateLimitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    private final CurrentAccountService currentAccount;
    private final RateLimitService rateLimits;

    public AuthController(UserAccountRepository users, PasswordEncoder passwords,
                          CurrentAccountService currentAccount, RateLimitService rateLimits) {
        this.users = users;
        this.passwords = passwords;
        this.currentAccount = currentAccount;
        this.rateLimits = rateLimits;
    }

    @GetMapping("/csrf")
    public CsrfResponse csrf(HttpServletRequest request) {
        HttpSession session = request.getSession(true);
        Object existing = session.getAttribute(CsrfConfiguration.SESSION_ATTRIBUTE);
        if (existing instanceof String token) {
            return new CsrfResponse(true, token);
        }

        String token = newCsrfToken();
        session.setAttribute(CsrfConfiguration.SESSION_ATTRIBUTE, token);
        return new CsrfResponse(true, token);
    }

    @GetMapping("/options")
    public AuthOptions options() {
        return new AuthOptions(true, false);
    }

    @GetMapping("/me")
    public AuthMe me(HttpServletRequest request) {
        return new AuthMe(true, userResponse(currentAccount.require(request)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiDtos.MessageResponse> register(
            @Valid @RequestBody ApiDtos.RegisterRequest body, HttpServletRequest request) {
        requireRateLimit("register", request, 5);
        String email = normalizeEmail(body.email());
        if (users.existsByEmail(email)) {
            throw ApiException.conflict("An account with this email already exists. Sign in instead.");
        }

        UserAccount account = new UserAccount(body.fullName().trim(), email,
                passwords.encode(body.password()), trimToNull(body.phone()));
        users.save(account);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiDtos.MessageResponse(true, "Account created. You can now sign in with your email and password."));
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody ApiDtos.LoginRequest body, HttpServletRequest request) {
        requireRateLimit("login", request, 10);
        UserAccount account = users.findByEmail(normalizeEmail(body.email()))
                .filter(user -> user.getPasswordHash() != null
                        && passwords.matches(body.password(), user.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                        "Email or password is incorrect."));

        if (passwords.upgradeEncoding(account.getPasswordHash())) {
            account.setPasswordHash(passwords.encode(body.password()));
            users.save(account);
        }
        HttpSession session = request.getSession(true);
        request.changeSessionId();
        session.setAttribute(CurrentAccountService.SESSION_USER_ID, account.getId().toString());
        session.setAttribute(CsrfConfiguration.SESSION_ATTRIBUTE, newCsrfToken());
        return new LoginResponse(true, userResponse(account));
    }

    @PostMapping("/logout")
    public ApiDtos.MessageResponse logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return new ApiDtos.MessageResponse(true, "Signed out.");
    }

    private void requireRateLimit(String scope, HttpServletRequest request, int limit) {
        if (!rateLimits.allow(scope, request.getRemoteAddr(), limit, Duration.ofMinutes(15))) {
            throw ApiException.tooManyRequests("Too many attempts. Please wait and try again.");
        }
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private static String newCsrfToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static ApiDtos.UserResponse userResponse(UserAccount account) {
        return new ApiDtos.UserResponse(account.getId(), account.getFullName(), account.getEmail(),
                account.getPhone(), account.getAddress(), account.isEmailVerified(),
                account.getRole().name(), account.getCreatedAt());
    }

    public record CsrfResponse(boolean success, String token) { }
    public record AuthOptions(boolean success, boolean googleEnabled) { }
    public record AuthMe(boolean success, ApiDtos.UserResponse user) { }
    public record LoginResponse(boolean success, ApiDtos.UserResponse user) { }
}
