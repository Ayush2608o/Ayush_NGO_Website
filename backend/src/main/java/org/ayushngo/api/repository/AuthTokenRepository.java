package org.ayushngo.api.repository;

import org.ayushngo.api.model.AuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AuthTokenRepository extends JpaRepository<AuthToken, UUID> {
    Optional<AuthToken> findFirstByTokenHashAndTypeAndUsedAtIsNullAndExpiresAtAfter(String tokenHash, AuthToken.Type type, Instant now);
    long countByUserIdAndTypeAndCreatedAtAfter(UUID userId, AuthToken.Type type, Instant after);

    @Modifying
    @Query("update AuthToken t set t.usedAt = :now where t.user.id = :userId and t.type = :type and t.usedAt is null")
    int consumeOutstanding(@Param("userId") UUID userId, @Param("type") AuthToken.Type type, @Param("now") Instant now);
}
