package org.ayushngo.api.repository;

import org.ayushngo.api.model.PaymentEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PaymentEventRepository extends JpaRepository<PaymentEvent, UUID> {
    boolean existsByProviderEventId(String providerEventId);
}
