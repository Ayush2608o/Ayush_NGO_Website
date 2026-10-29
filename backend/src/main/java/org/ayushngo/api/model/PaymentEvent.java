package org.ayushngo.api.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_events", indexes = @Index(name = "ix_payment_event_donation", columnList = "donation_id"))
public class PaymentEvent {
    @Id @GeneratedValue(strategy = GenerationType.UUID) @Column(columnDefinition = "BINARY(16)")
    private UUID id;
    @Column(name = "provider_event_id", nullable = false, unique = true, length = 180) private String providerEventId;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "donation_id", nullable = false, columnDefinition = "BINARY(16)") private Donation donation;
    @Column(name = "event_type", nullable = false, length = 80) private String eventType;
    @Column(name = "received_at", nullable = false, insertable = false, updatable = false) private Instant receivedAt;
    protected PaymentEvent() { }
    public PaymentEvent(String providerEventId, Donation donation, String eventType) {
        this.providerEventId = providerEventId; this.donation = donation; this.eventType = eventType;
    }
}
