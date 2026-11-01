package org.ayushngo.api.repository;

import org.ayushngo.api.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DonationRepository extends JpaRepository<Donation, UUID> {
    interface CurrencyTotal { String getCurrency(); BigDecimal getTotal(); }
    interface MonthTotal { String getMonth(); String getCurrency(); BigDecimal getTotal(); }
    interface ProjectTotal { String getProjectName(); String getCurrency(); BigDecimal getTotal(); Long getTransactions(); }

    List<Donation> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Donation> findByProviderReference(String providerReference);
    Optional<Donation> findByIdAndUserId(UUID id, UUID userId);
    long countByUserIdAndStatus(UUID userId, Donation.Status status);
    Optional<Donation> findFirstByUserIdAndStatusOrderByPaidAtDesc(UUID userId, Donation.Status status);

    @Query("select d.currency as currency, sum(d.amount) as total from Donation d where d.user.id = :userId and d.status = :status group by d.currency")
    List<CurrencyTotal> successfulTotalsForUser(@Param("userId") UUID userId, @Param("status") Donation.Status status);

    @Query(value = "select date_format(paid_at, '%Y-%m') as month, currency as currency, sum(amount) as total from donations where user_id = :userId and status = 'SUCCEEDED' and paid_at is not null group by date_format(paid_at, '%Y-%m'), currency order by month", nativeQuery = true)
    List<MonthTotal> monthlyTotalsForUser(@Param("userId") UUID userId);

    @Query("select d.currency as currency, sum(d.amount) as total from Donation d where d.status = :status group by d.currency")
    List<CurrencyTotal> successfulTotals(@Param("status") Donation.Status status);

    @Query(value = "select count(*) from donations where status = 'SUCCEEDED' and paid_at >= :start and paid_at < :end", nativeQuery = true)
    long countSuccessfulBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query(value = "select count(distinct lower(donor_email)) from donations where status = 'SUCCEEDED'", nativeQuery = true)
    long countUniqueSuccessfulDonors();

    @Query(value = "select project_name as projectName, currency as currency, sum(amount) as total, count(*) as transactions from donations where status = 'SUCCEEDED' group by project_name, currency order by total desc", nativeQuery = true)
    List<ProjectTotal> successfulTotalsByProject();

    @Query(value = "select date_format(paid_at, '%Y-%m') as month, currency as currency, sum(amount) as total from donations where status = 'SUCCEEDED' and paid_at is not null group by date_format(paid_at, '%Y-%m'), currency order by month", nativeQuery = true)
    List<MonthTotal> successfulMonthlyTotals();

    List<Donation> findTop20ByOrderByCreatedAtDesc();
}
