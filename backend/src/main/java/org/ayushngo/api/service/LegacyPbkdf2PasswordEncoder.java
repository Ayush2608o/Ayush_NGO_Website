package org.ayushngo.api.service;

import org.springframework.security.crypto.password.PasswordEncoder;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

public class LegacyPbkdf2PasswordEncoder implements PasswordEncoder {
    private static final int ITERATIONS = 210_000;
    private static final int HASH_BITS = 256;
    private static final int SALT_BYTES = 16;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public String encode(CharSequence rawPassword) {
        byte[] salt = new byte[SALT_BYTES];
        RANDOM.nextBytes(salt);
        return encodeStored(salt, derive(rawPassword, salt));
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) return false;
        String[] parts = encodedPassword.split("\\$", -1);
        if (parts.length != 2) return false;
        try {
            byte[] salt = Base64.getUrlDecoder().decode(parts[0]);
            byte[] expected = Base64.getUrlDecoder().decode(parts[1]);
            byte[] actual = derive(rawPassword, salt);
            return MessageDigest.isEqual(expected, actual);
        } catch (IllegalArgumentException error) {
            return false;
        }
    }

    public String encodeStored(byte[] salt, byte[] hash) {
        if (salt.length != SALT_BYTES || hash.length != HASH_BITS / 8) {
            throw new IllegalArgumentException("Invalid legacy password hash.");
        }
        Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
        return encoder.encodeToString(salt) + "$" + encoder.encodeToString(hash);
    }

    private static byte[] derive(CharSequence password, byte[] salt) {
        char[] characters = toChars(password);
        PBEKeySpec specification = new PBEKeySpec(characters, salt, ITERATIONS, HASH_BITS);
        try {
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                    .generateSecret(specification).getEncoded();
        } catch (GeneralSecurityException error) {
            throw new IllegalStateException("Legacy password verification is unavailable.", error);
        } finally {
            specification.clearPassword();
            Arrays.fill(characters, '\0');
        }
    }

    private static char[] toChars(CharSequence value) {
        char[] result = new char[value.length()];
        for (int i = 0; i < value.length(); i++) result[i] = value.charAt(i);
        return result;
    }
}
