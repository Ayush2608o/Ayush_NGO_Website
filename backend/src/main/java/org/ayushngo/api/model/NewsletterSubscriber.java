package org.ayushngo.api.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "newsletter_subscribers")
public class NewsletterSubscriber {
    @Id @GeneratedValue(strategy = GenerationType.UUID) @Column(columnDefinition = "BINARY(16)")
    private UUID id;
    @Column(nullable = false, unique = true, length = 254) private String email;
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false) private Instant createdAt;
    protected NewsletterSubscriber() { }
    public NewsletterSubscriber(String email) { this.email = email; }
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public Instant getCreatedAt() { return createdAt; }
}
