package org.ayushngo.api.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.ayushngo.api.model.UserAccount;
import org.ayushngo.api.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CurrentAccountService {
    public static final String SESSION_USER_ID = "AYUSH_USER_ID";

    private final UserAccountRepository users;

    public CurrentAccountService(UserAccountRepository users) {
        this.users = users;
    }

    public UserAccount require(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Object value = session == null ? null : session.getAttribute(SESSION_USER_ID);
        if (!(value instanceof String id)) {
            throw ApiException.unauthorized("Sign in to continue.");
        }

        try {
            return users.findById(UUID.fromString(id))
                    .orElseThrow(() -> ApiException.unauthorized("Sign in to continue."));
        } catch (IllegalArgumentException error) {
            throw ApiException.unauthorized("Sign in to continue.");
        }
    }
}
