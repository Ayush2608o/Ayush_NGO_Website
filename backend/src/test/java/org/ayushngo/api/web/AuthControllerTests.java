package org.ayushngo.api.web;

import jakarta.servlet.http.HttpSession;
import org.ayushngo.api.dto.ApiDtos;
import org.ayushngo.api.model.UserAccount;
import org.ayushngo.api.model.UserRole;
import org.ayushngo.api.repository.UserAccountRepository;
import org.ayushngo.api.service.CurrentAccountService;
import org.ayushngo.api.service.RateLimitService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.ArgumentCaptor;

class AuthControllerTests {
    private final UserAccountRepository users = mock(UserAccountRepository.class);
    private final PasswordEncoder passwords = mock(PasswordEncoder.class);
    private final CurrentAccountService currentAccount = mock(CurrentAccountService.class);
    private final RateLimitService rateLimits = mock(RateLimitService.class);
    private final AuthController controller = new AuthController(users, passwords, currentAccount, rateLimits);

    @BeforeEach
    void allowRequests() {
        when(rateLimits.allow(anyString(), anyString(), anyInt(), any(Duration.class))).thenReturn(true);
    }

    @Test
    void registrationStoresNormalizedEmailAndEncodedPassword() {
        when(passwords.encode("StrongPassword1!")).thenReturn("{bcrypt}encoded-password");

        var response = controller.register(new ApiDtos.RegisterRequest(
                "  Asha User  ", "ASHA@example.com", "  1234567890  ", "StrongPassword1!"),
                request());

        ArgumentCaptor<UserAccount> account = ArgumentCaptor.forClass(UserAccount.class);
        verify(users).save(account.capture());
        assertEquals(201, response.getStatusCode().value());
        assertEquals("asha@example.com", account.getValue().getEmail());
        assertEquals("Asha User", account.getValue().getFullName());
        assertEquals("1234567890", account.getValue().getPhone());
        assertEquals("{bcrypt}encoded-password", account.getValue().getPasswordHash());
        assertFalse(account.getValue().isEmailVerified());
    }

    @Test
    void csrfTokenIsStoredInAndReusedFromSession() {
        MockHttpServletRequest request = request();

        AuthController.CsrfResponse first = controller.csrf(request);
        AuthController.CsrfResponse second = controller.csrf(request);

        assertTrue(first.success());
        assertEquals(first.token(), second.token());
        assertEquals(43, first.token().length());
        assertNotNull(request.getSession(false));
    }

    @Test
    void loginStoresTheSqlAccountIdInTheSession() {
        UUID userId = UUID.randomUUID();
        UserAccount account = mock(UserAccount.class);
        when(users.findByEmail("asha@example.com")).thenReturn(Optional.of(account));
        when(account.getPasswordHash()).thenReturn("{bcrypt}encoded-password");
        when(account.getId()).thenReturn(userId);
        when(account.getFullName()).thenReturn("Asha User");
        when(account.getEmail()).thenReturn("asha@example.com");
        when(account.getRole()).thenReturn(UserRole.USER);
        when(passwords.matches("StrongPassword1!", "{bcrypt}encoded-password")).thenReturn(true);

        MockHttpServletRequest request = request();
        AuthController.LoginResponse response = controller.login(
                new ApiDtos.LoginRequest("ASHA@example.com", "StrongPassword1!"), request);
        HttpSession session = request.getSession(false);

        assertTrue(response.success());
        assertEquals("Asha User", response.user().fullName());
        assertEquals(userId.toString(), session.getAttribute(CurrentAccountService.SESSION_USER_ID));
    }

    private static MockHttpServletRequest request() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        return request;
    }
}
