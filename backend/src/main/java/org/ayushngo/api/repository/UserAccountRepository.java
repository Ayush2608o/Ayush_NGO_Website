package org.ayushngo.api.repository;

import org.ayushngo.api.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByEmail(String email);
    Optional<UserAccount> findByGoogleSubject(String googleSubject);
    boolean existsByEmail(String email);
}
