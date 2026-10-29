package org.ayushngo.api.service;

import org.ayushngo.api.model.AuthToken;
import org.ayushngo.api.model.UserAccount;
import org.ayushngo.api.repository.AuthTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
public class TokenService {
    private final AuthTokenRepository tokens;
    private final SecureRandom random = new SecureRandom();
    public TokenService(AuthTokenRepository tokens) { this.tokens = tokens; }

    @Transactional
    public String issue(UserAccount user, AuthToken.Type type, Duration lifetime) {
        Instant now = Instant.now();
        tokens.consumeOutstanding(user.getId(), type, now);
        byte[] raw = new byte[32];
        random.nextBytes(raw);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        tokens.save(new AuthToken(user, hash(token), type, now.plus(lifetime)));
        return token;
    }

    @Transactional
    public AuthToken consume(String token, AuthToken.Type type) {
        if (token == null || token.length() < 32 || token.length() > 256) throw ApiException.badRequest("This link is invalid or has expired.");
        AuthToken found = tokens.findFirstByTokenHashAndTypeAndUsedAtIsNullAndExpiresAtAfter(hash(token), type, Instant.now())
                .orElseThrow(() -> ApiException.badRequest("This link is invalid or has expired."));
        found.setUsedAt(Instant.now());
        return found;
    }

    private String hash(String value) {
        try { return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }
}
