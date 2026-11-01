package org.ayushngo.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "donations", indexes = {
        @Index(name = "ix_donation_user_created", columnList = "user_id,created_at"),
        @Index(name = "ix_donation_status_created", columnList = "status,created_at"),
        @Index(name = "ix_donation_project_status", columnList = "project_name,status")
})
public class Donation {
    public enum Status { PENDING_PAYMENT, SUCCEEDED, FAILED, CANCELLED, REFUNDED }
    public enum Frequency { ONE_TIME, MONTHLY }

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", columnDefinition = "BINARY(16)")
    private UserAccount user;

    @Column(name = "donor_name", nullable = false, length = 120)
    private String donorName;

    @Column(name = "donor_email", nullable = false, length = 254)
    private String donorEmail;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Frequency frequency;

    @Column(name = "project_name", nullable = false, length = 120)
    private String projectName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private Status status = Status.PENDING_PAYMENT;

    @Column(name = "provider_reference", unique = true, length = 160)
    private String providerReference;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "refunded_at")
    private Instant refundedAt;

    protected Donation() { }
    public Donation(UserAccount user, String donorName, String donorEmail, BigDecimal amount, String currency,
                    Frequency frequency, String projectName) {
        this(user, donorName, donorEmail, amount, currency, frequency, projectName, null, Instant.now());
    }
    public Donation(UserAccount user, String donorName, String donorEmail, BigDecimal amount, String currency,
                    Frequency frequency, String projectName, String providerReference, Instant createdAt) {
        this.user = user; this.donorName = donorName; this.donorEmail = donorEmail; this.amount = amount;
        this.currency = currency; this.frequency = frequency; this.projectName = projectName;
        this.status = Status.PENDING_PAYMENT;
        this.providerReference = providerReference;
        this.createdAt = createdAt;
    }
    public UUID getId() { return id; }
    public UserAccount getUser() { return user; }
    public String getDonorName() { return donorName; }
    public String getDonorEmail() { return donorEmail; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public Frequency getFrequency() { return frequency; }
    public String getProjectName() { return projectName; }
    public Status getStatus() { return status; }
    public String getProviderReference() { return providerReference; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getPaidAt() { return paidAt; }
    public Instant getRefundedAt() { return refundedAt; }
}
