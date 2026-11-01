package org.ayushngo.api.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ApiDtos {
    private ApiDtos() { }

    public record RegisterRequest(@NotBlank @Size(max = 120) String fullName,
                                  @NotBlank @Email @Size(max = 254) String email,
                                  @Size(max = 40) String phone,
                                  @NotBlank @Pattern(regexp = "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{12,72}") String password) { }
    public record LoginRequest(@NotBlank @Email @Size(max = 254) String email, @NotBlank @Size(max = 72) String password) { }
    public record EmailRequest(@NotBlank @Email @Size(max = 254) String email) { }
    public record TokenRequest(@NotBlank @Size(max = 256) String token) { }
    public record ResetPasswordRequest(@NotBlank @Size(max = 256) String token,
                                       @NotBlank @Pattern(regexp = "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{12,72}") String password) { }
    public record ProfileUpdateRequest(@NotBlank @Size(max = 120) String fullName,
                                      @Size(max = 40) String phone,
                                      @Size(max = 500) String address) { }
    public record DonationRequest(@NotBlank @Size(max = 120) String donorName,
                                  @NotBlank @Email @Size(max = 254) String donorEmail,
                                  @NotNull @DecimalMin("5.00") @DecimalMax("1000000.00")
                                  @Digits(integer = 10, fraction = 2) BigDecimal amount,
                                  @NotBlank @Pattern(regexp = "USD|INR") String currency,
                                  @NotBlank @Pattern(regexp = "one-time|monthly|ONE_TIME|MONTHLY") String frequency,
                                  @NotBlank @Size(max = 120) String cause) { }
    public record ContactRequest(@NotBlank @Size(max = 120) String name,
                                 @NotBlank @Email @Size(max = 254) String email,
                                 @Size(max = 40) String phone,
                                 @NotBlank @Size(max = 200) String subject,
                                 @NotBlank @Size(max = 4000) String message,
                                 @Size(max = 200) String botField) { }
    public record NewsletterRequest(@NotBlank @Email @Size(max = 254) String email,
                                    @Size(max = 200) String botField) { }
    public record VolunteerRequest(@NotBlank @Size(max = 120) String name,
                                   @NotBlank @Email @Size(max = 254) String email,
                                   @NotBlank @Size(min = 5, max = 40) String phone,
                                   @NotBlank @Size(max = 120) String city,
                                   @Size(max = 120) String state,
                                   @Min(13) @Max(120) Integer age,
                                   @Size(max = 160) String occupation,
                                   @NotBlank @Size(max = 500) String skill,
                                   @Size(max = 1000) String areasOfInterest,
                                   @Size(max = 200) String availability,
                                   @Pattern(regexp = "|remote|onsite|hybrid") String preference,
                                   @Size(max = 2000) String motivation,
                                   @Size(max = 200) String botField) { }

    public record MessageResponse(boolean success, String message) { }
    public record UserResponse(UUID id, String fullName, String email, String phone, String address,
                               boolean emailVerified, String role, Instant memberSince) { }
    public record DonationCreatedResponse(boolean success, UUID id, String requestId, String status,
                                          BigDecimal amount, String currency, String frequency,
                                          boolean paymentConfigured, String message) { }
    public record DonationResponse(UUID id, String projectName, BigDecimal amount, String currency,
                                   String frequency, String status, Instant createdAt, Instant paidAt) { }
    public record CurrencyTotal(String currency, BigDecimal total) { }
    public record MonthlyTotal(String month, String currency, BigDecimal total) { }
    public record DonationSummary(List<CurrencyTotal> successfulTotals, long successfulCount,
                                  BigDecimal mostRecentAmount, String mostRecentCurrency,
                                  Instant mostRecentAt, List<MonthlyTotal> monthly) { }
    public record ErrorResponse(String message, String code) { }
}
