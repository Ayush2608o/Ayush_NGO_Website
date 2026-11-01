package org.ayushngo.api.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "contact_messages", indexes = @Index(name = "ix_contact_email_created", columnList = "email,created_at"))
public class ContactMessage {
    @Id @GeneratedValue(strategy = GenerationType.UUID) @Column(columnDefinition = "BINARY(16)")
    private UUID id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, length = 254) private String email;
    @Column(length = 40) private String phone;
    @Column(nullable = false, length = 200) private String subject;
    @Column(nullable = false, length = 4000) private String message;
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false) private Instant createdAt;
    protected ContactMessage() { }
    public ContactMessage(String name, String email, String phone, String subject, String message) {
        this.name = name; this.email = email; this.phone = phone; this.subject = subject; this.message = message;
    }
    public UUID getId() { return id; }
    public Instant getCreatedAt() { return createdAt; }
}
