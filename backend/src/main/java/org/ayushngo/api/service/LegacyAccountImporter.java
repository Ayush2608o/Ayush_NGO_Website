package org.ayushngo.api.service;

import org.ayushngo.api.model.UserAccount;
import org.ayushngo.api.model.Donation;
import org.ayushngo.api.model.NewsletterSubscriber;
import org.ayushngo.api.repository.DonationRepository;
import org.ayushngo.api.repository.NewsletterRepository;
import org.ayushngo.api.repository.UserAccountRepository;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.regex.Pattern;

@Component
public class LegacyAccountImporter implements ApplicationRunner {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final Path legacyFile;
    private final UserAccountRepository users;
    private final DonationRepository donations;
    private final NewsletterRepository newsletters;
    private final LegacyPbkdf2PasswordEncoder legacyPasswords;
    private final ObjectMapper objectMapper;

    public LegacyAccountImporter(
            @Value("${app.legacy-account-import.directory}") String dataDirectory,
            UserAccountRepository users, DonationRepository donations, NewsletterRepository newsletters,
            LegacyPbkdf2PasswordEncoder legacyPasswords, ObjectMapper objectMapper) {
        this.legacyFile = Path.of(dataDirectory).resolve("accounts.tsv");
        this.users = users;
        this.donations = donations;
        this.newsletters = newsletters;
        this.legacyPasswords = legacyPasswords;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        int imported = importAccounts();
        imported += importDonations();
        imported += importNewsletterSubscribers();
        if (imported > 0) {
            System.out.println("Imported " + imported + " legacy record(s) into SQL.");
        }
    }

    private int importAccounts() {
        Path file = legacyFile;
        if (!Files.exists(file)) return 0;
        int imported = 0;
        try (BufferedReader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) continue;
                UserAccount account = decode(line, lineNumber);
                if (users.existsByEmail(account.getEmail())) continue;
                users.save(account);
                imported++;
            }
        } catch (IOException error) {
            throw new IllegalStateException("Could not read the legacy account store.", error);
        }
        return imported;
    }

    private int importDonations() {
        Path file = legacyFile.resolveSibling("donations.jsonl");
        if (!Files.exists(file)) return 0;
        int imported = 0;
        try (BufferedReader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) continue;
                JsonNode record = parseJson(line, "donation", lineNumber);
                String requestId = requiredText(record, "requestId", "donation", lineNumber);
                if (donations.findByProviderReference(requestId).isPresent()) continue;
                String email = requiredText(record, "donorEmail", "donation", lineNumber)
                        .toLowerCase(Locale.ROOT);
                String name = requiredText(record, "donorName", "donation", lineNumber);
                String currency = requiredText(record, "currency", "donation", lineNumber);
                String cause = requiredText(record, "cause", "donation", lineNumber);
                String frequency = requiredText(record, "frequency", "donation", lineNumber);
                BigDecimal amount = decimal(record, "amount", "donation", lineNumber);
                if (!EMAIL.matcher(email).matches() || name.length() > 120 || cause.length() > 120
                        || !currency.matches("USD|INR") || amount.compareTo(new BigDecimal("5.00")) < 0
                        || amount.compareTo(new BigDecimal("1000000.00")) > 0) {
                    throw invalidRow("donation", lineNumber);
                }
                Donation.Frequency donationFrequency = switch (frequency) {
                    case "monthly" -> Donation.Frequency.MONTHLY;
                    case "one-time" -> Donation.Frequency.ONE_TIME;
                    default -> throw invalidRow("donation", lineNumber);
                };
                Instant createdAt = instant(record, "timestamp", lineNumber);
                UserAccount account = users.findByEmail(email).orElse(null);
                donations.save(new Donation(account, name, email, amount, currency,
                        donationFrequency, cause, requestId, createdAt));
                imported++;
            }
        } catch (IOException error) {
            throw new IllegalStateException("Could not read the legacy donation store.", error);
        }
        return imported;
    }

    private int importNewsletterSubscribers() {
        Path file = legacyFile.resolveSibling("newsletter.jsonl");
        if (!Files.exists(file)) return 0;
        int imported = 0;
        try (BufferedReader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) continue;
                JsonNode record = parseJson(line, "newsletter", lineNumber);
                String email = requiredText(record, "email", "newsletter", lineNumber)
                        .toLowerCase(Locale.ROOT);
                if (!EMAIL.matcher(email).matches()) throw invalidRow("newsletter", lineNumber);
                if (newsletters.existsByEmail(email)) continue;
                newsletters.save(new NewsletterSubscriber(email));
                imported++;
            }
        } catch (IOException error) {
            throw new IllegalStateException("Could not read the legacy newsletter store.", error);
        }
        return imported;
    }

    private JsonNode parseJson(String line, String source, int lineNumber) {
        try {
            JsonNode record = objectMapper.readTree(line);
            if (record == null || !record.isObject()) throw invalidRow(source, lineNumber);
            return record;
        } catch (JacksonException error) {
            throw invalidRow(source, lineNumber);
        }
    }

    private static String requiredText(JsonNode record, String field, String source, int lineNumber) {
        JsonNode value = record.get(field);
        if (value == null || !value.isTextual() || value.asText().isBlank()) {
            throw invalidRow(source, lineNumber);
        }
        return value.asText().trim();
    }

    private static BigDecimal decimal(JsonNode record, String field, String source, int lineNumber) {
        JsonNode value = record.get(field);
        if (value == null || !value.isNumber()) throw invalidRow(source, lineNumber);
        return value.decimalValue();
    }

    private static Instant instant(JsonNode record, String field, int lineNumber) {
        JsonNode value = record.get(field);
        if (value == null || !value.isTextual()) return Instant.EPOCH;
        try {
            return Instant.parse(value.asText());
        } catch (java.time.format.DateTimeParseException error) {
            throw invalidRow("donation", lineNumber);
        }
    }

    private static IllegalStateException invalidRow(String source, int lineNumber) {
        return new IllegalStateException("Legacy " + source + " file contains an invalid row at line " + lineNumber + ".");
    }

    private UserAccount decode(String line, int lineNumber) {
        String[] fields = line.replaceFirst("^\\uFEFF", "").split("\\t", -1);
        if (fields.length != 6) throw invalidRow("account", lineNumber);

        try {
            String email = decodeText(fields[0]).trim().toLowerCase(Locale.ROOT);
            String name = decodeText(fields[1]).trim();
            String phone = decodeText(fields[2]).trim();
            String address = decodeText(fields[3]).trim();
            byte[] salt = HexFormat.of().parseHex(fields[4]);
            byte[] hash = HexFormat.of().parseHex(fields[5]);
            if (!EMAIL.matcher(email).matches() || name.isBlank() || name.length() > 120
                    || phone.length() > 40 || address.length() > 500) {
                throw invalidRow("account", lineNumber);
            }

            UserAccount account = new UserAccount(name, email, null, emptyToNull(phone));
            account.setAddress(emptyToNull(address));
            account.setPasswordHash("{legacy-pbkdf2}" + legacyPasswords.encodeStored(salt, hash));
            return account;
        } catch (IllegalArgumentException error) {
            throw invalidRow("account", lineNumber);
        }
    }

    private static String decodeText(String value) {
        return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
    }

    private static String emptyToNull(String value) {
        return value.isEmpty() ? null : value;
    }

}
