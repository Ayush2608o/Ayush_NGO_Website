package org.ayushngo.api.service;

import org.ayushngo.api.model.UserAccount;
import org.ayushngo.api.model.Donation;
import org.ayushngo.api.model.NewsletterSubscriber;
import org.ayushngo.api.repository.DonationRepository;
import org.ayushngo.api.repository.NewsletterRepository;
import org.ayushngo.api.repository.UserAccountRepository;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.ArgumentCaptor;

class LegacyAccountImporterTests {
    @TempDir
    Path dataDirectory;

    @Test
    void importsLegacyAccountsWithoutExposingTheirPasswords() throws Exception {
        LegacyPbkdf2PasswordEncoder encoder = new LegacyPbkdf2PasswordEncoder();
        UserAccountRepository users = mock(UserAccountRepository.class);
        DonationRepository donations = mock(DonationRepository.class);
        NewsletterRepository newsletters = mock(NewsletterRepository.class);
        when(users.existsByEmail("legacy@example.com")).thenReturn(false);
        String oldPassword = "LegacyPassword1!";
        String[] hashParts = encoder.encode(oldPassword).split("\\$", -1);
        byte[] salt = Base64.getUrlDecoder().decode(hashParts[0]);
        byte[] passwordHash = Base64.getUrlDecoder().decode(hashParts[1]);
        String row = String.join("\t",
                encodeText("LEGACY@example.com"),
                encodeText("Legacy User"),
                encodeText("1234567890"),
                encodeText("Somewhere"),
                HexFormat.of().formatHex(salt),
                HexFormat.of().formatHex(passwordHash));
        Files.writeString(dataDirectory.resolve("accounts.tsv"), row, StandardCharsets.UTF_8);

        LegacyAccountImporter importer = importer(users, donations, newsletters, encoder);
        importer.run(null);

        ArgumentCaptor<UserAccount> account = ArgumentCaptor.forClass(UserAccount.class);
        verify(users).save(account.capture());
        assertEquals("legacy@example.com", account.getValue().getEmail());
        assertEquals("Legacy User", account.getValue().getFullName());
        assertEquals("Somewhere", account.getValue().getAddress());
        assertFalse(account.getValue().isEmailVerified());
        assertTrue(account.getValue().getPasswordHash().startsWith("{legacy-pbkdf2}"));
        assertTrue(encoder.matches(oldPassword, account.getValue().getPasswordHash()
                .substring("{legacy-pbkdf2}".length())));
    }

    @Test
    void importsDonationHistoryAndNewsletterSubscriptions() throws Exception {
        UserAccountRepository users = mock(UserAccountRepository.class);
        DonationRepository donations = mock(DonationRepository.class);
        NewsletterRepository newsletters = mock(NewsletterRepository.class);
        String requestId = "AYUSH-test-request";
        Instant donatedAt = Instant.parse("2026-10-29T12:00:00Z");
        Files.writeString(dataDirectory.resolve("donations.jsonl"),
                "{\"requestId\":\"" + requestId + "\",\"donorEmail\":\"donor@example.com\","
                        + "\"donorName\":\"Donor User\",\"currency\":\"USD\",\"frequency\":\"monthly\","
                        + "\"cause\":\"Education\",\"amount\":25.00,\"status\":\"PENDING_PAYMENT\","
                        + "\"timestamp\":\"" + donatedAt + "\"}\n",
                StandardCharsets.UTF_8);
        Files.writeString(dataDirectory.resolve("newsletter.jsonl"),
                "{\"email\":\"NEWS@example.com\"}\n", StandardCharsets.UTF_8);
        when(donations.findByProviderReference(requestId)).thenReturn(Optional.empty());
        when(users.findByEmail("donor@example.com")).thenReturn(Optional.empty());
        when(newsletters.existsByEmail("news@example.com")).thenReturn(false);

        importer(users, donations, newsletters, new LegacyPbkdf2PasswordEncoder()).run(null);

        ArgumentCaptor<Donation> donation = ArgumentCaptor.forClass(Donation.class);
        verify(donations).save(donation.capture());
        assertEquals(requestId, donation.getValue().getProviderReference());
        assertEquals(Donation.Frequency.MONTHLY, donation.getValue().getFrequency());
        assertEquals(Donation.Status.PENDING_PAYMENT, donation.getValue().getStatus());
        assertEquals(0, new BigDecimal("25.00").compareTo(donation.getValue().getAmount()));
        assertEquals(donatedAt, donation.getValue().getCreatedAt());

        ArgumentCaptor<NewsletterSubscriber> subscriber = ArgumentCaptor.forClass(NewsletterSubscriber.class);
        verify(newsletters).save(subscriber.capture());
        assertEquals("news@example.com", subscriber.getValue().getEmail());
    }

    private LegacyAccountImporter importer(UserAccountRepository users, DonationRepository donations,
                                           NewsletterRepository newsletters,
                                           LegacyPbkdf2PasswordEncoder encoder) {
        return new LegacyAccountImporter(dataDirectory.toString(), users, donations, newsletters,
                encoder, new ObjectMapper());
    }

    private static String encodeText(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }
}
