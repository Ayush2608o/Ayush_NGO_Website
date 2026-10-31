package backend;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.io.Console;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

/** Local recovery tool for accounts when email recovery is not configured. */
public final class ResetAccountPassword {
    private static final int ITERATIONS = 210_000;
    private static final SecureRandom RANDOM = new SecureRandom();

    private ResetAccountPassword() { }

    public static void main(String[] args) throws Exception {
        Console console = System.console();
        if (console == null) {
            System.err.println("Run this command from a normal PowerShell or Command Prompt terminal so password input stays hidden.");
            System.exit(2);
        }

        Path dataDirectory = Path.of(System.getenv().getOrDefault("DATA_DIR",
                Path.of(System.getProperty("user.home"), ".ayush-ngo-data").toString())).toAbsolutePath().normalize();
        Path accountFile = dataDirectory.resolve("accounts.tsv");
        if (!Files.isRegularFile(accountFile)) {
            System.err.println("No account file was found at " + accountFile);
            System.exit(1);
        }

        String email = console.readLine("Account email: ");
        if (email == null || email.isBlank()) {
            System.err.println("Enter the email address used for the account.");
            System.exit(1);
        }
        email = email.trim().toLowerCase(Locale.ROOT);

        List<String> lines = new ArrayList<>(Files.readAllLines(accountFile, StandardCharsets.UTF_8));
        int accountLine = -1;
        String[] fields = null;
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i).replaceFirst("^\\uFEFF", "");
            String[] candidate = line.split("\\t", -1);
            if (candidate.length != 6) continue;
            try {
                if (decode(candidate[0]).equalsIgnoreCase(email)) {
                    accountLine = i;
                    fields = candidate;
                    break;
                }
            } catch (IllegalArgumentException ignored) { }
        }
        if (accountLine < 0) {
            System.err.println("No saved account matches that email address.");
            System.exit(1);
        }

        char[] password = console.readPassword("New password (12+ chars, upper/lowercase, number, symbol): ");
        char[] confirmation = console.readPassword("Confirm new password: ");
        try {
            if (!validPassword(password)) {
                System.err.println("Password does not meet the required length and character rules.");
                System.exit(1);
            }
            if (!Arrays.equals(password, confirmation)) {
                System.err.println("Passwords do not match.");
                System.exit(1);
            }

            byte[] salt = new byte[16];
            RANDOM.nextBytes(salt);
            byte[] hash = hash(password, salt);
            fields[4] = HexFormat.of().formatHex(salt);
            fields[5] = HexFormat.of().formatHex(hash);
            lines.set(accountLine, String.join("\t", fields));

            Path temporaryFile = Files.createTempFile(dataDirectory, "accounts-reset-", ".tmp");
            try {
                Files.write(temporaryFile, lines, StandardCharsets.UTF_8);
                try {
                    Files.move(temporaryFile, accountFile, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
                } catch (IOException atomicMoveUnsupported) {
                    Files.move(temporaryFile, accountFile, StandardCopyOption.REPLACE_EXISTING);
                }
            } finally {
                Files.deleteIfExists(temporaryFile);
            }
            console.printf("Password updated for %s. You can now sign in.%n", email);
        } finally {
            Arrays.fill(password, '\0');
            Arrays.fill(confirmation, '\0');
        }
    }

    private static boolean validPassword(char[] password) {
        if (password == null || password.length < 12 || password.length > 72) return false;
        boolean lower = false, upper = false, digit = false, symbol = false;
        for (char c : password) {
            lower |= Character.isLowerCase(c);
            upper |= Character.isUpperCase(c);
            digit |= Character.isDigit(c);
            symbol |= !Character.isLetterOrDigit(c);
        }
        return lower && upper && digit && symbol;
    }

    private static byte[] hash(char[] password, byte[] salt) throws Exception {
        PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, 256);
        try { return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded(); }
        finally { spec.clearPassword(); }
    }

    private static String decode(String value) {
        return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
    }
}
