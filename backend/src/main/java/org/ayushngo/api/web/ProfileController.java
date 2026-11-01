package org.ayushngo.api.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.ayushngo.api.dto.ApiDtos;
import org.ayushngo.api.model.UserAccount;
import org.ayushngo.api.repository.UserAccountRepository;
import org.ayushngo.api.service.CurrentAccountService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final CurrentAccountService currentAccount;
    private final UserAccountRepository users;

    public ProfileController(CurrentAccountService currentAccount, UserAccountRepository users) {
        this.currentAccount = currentAccount;
        this.users = users;
    }

    @GetMapping("/me")
    public AuthController.AuthMe me(HttpServletRequest request) {
        return new AuthController.AuthMe(true, AuthController.userResponse(currentAccount.require(request)));
    }

    @PutMapping("/me")
    @Transactional
    public ProfileResponse update(@Valid @RequestBody ApiDtos.ProfileUpdateRequest body,
                                  HttpServletRequest request) {
        UserAccount account = currentAccount.require(request);
        account.setFullName(body.fullName().trim());
        account.setPhone(trimToNull(body.phone()));
        account.setAddress(trimToNull(body.address()));
        users.save(account);
        return new ProfileResponse(true, "Profile saved.", AuthController.userResponse(account));
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    public record ProfileResponse(boolean success, String message, ApiDtos.UserResponse user) { }
}
