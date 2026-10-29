package org.ayushngo.api.repository;

import org.ayushngo.api.model.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, UUID> { }
