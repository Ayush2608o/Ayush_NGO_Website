package org.ayushngo.api.service;

import org.ayushngo.api.model.UserAccount;
import org.ayushngo.api.repository.UserAccountRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Locale;

@Service
public class AccountUserDetailsService implements UserDetailsService {
    private final UserAccountRepository users;
    public AccountUserDetailsService(UserAccountRepository users) { this.users = users; }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserAccount account = users.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
        String storedPassword = account.getPasswordHash() == null ? "{bcrypt}$2a$10$invalid.invalid.invalid.invalid.invalid.invalid.invalid" : account.getPasswordHash();
        return User.withUsername(account.getEmail()).password(storedPassword)
                .roles(account.getRole().name()).disabled(!account.isEmailVerified()).build();
    }
}
