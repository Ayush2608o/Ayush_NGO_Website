package org.ayushngo.api.repository;

import org.ayushngo.api.model.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface NewsletterRepository extends JpaRepository<NewsletterSubscriber, UUID> {
    boolean existsByEmail(String email);
}
