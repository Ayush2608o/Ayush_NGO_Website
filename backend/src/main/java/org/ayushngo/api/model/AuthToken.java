package org.ayushngo.api.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_tokens", indexes = {
        @Index(name = "ix_auth_token_user_type", columnList = "user_id,token_type"),
        @Index(name = "ix_auth_token_expiry", columnList = "expires_at")
})
public class AuthToken {
    public enum Type { VERIFY_EMAIL, RESET_PASSWORD }

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, columnDefinition = "BINARY(16)")
    private UserAccount user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "token_type", nullable = false, length = 24)
    private Type type;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    protected AuthToken() { }
    public AuthToken(UserAccount user, String tokenHash, Type type, Instant expiresAt) {
        this.user = user; this.tokenHash = tokenHash; this.type = type; this.expiresAt = expiresAt;
    }
    public UUID getId() { return id; }
    public UserAccount getUser() { return user; }
    public String getTokenHash() { return tokenHash; }
    public Type getType() { return type; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getUsedAt() { return usedAt; }
    public void setUsedAt(Instant usedAt) { this.usedAt = usedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
