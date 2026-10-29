package org.ayushngo.api.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class EmailDeliveryService {
    private final ObjectProvider<JavaMailSender> mailSender;
    private final boolean enabled;
    private final String from;
    private final String frontendUrl;

    public EmailDeliveryService(ObjectProvider<JavaMailSender> mailSender,
                                @Value("${app.email.enabled:false}") boolean enabled,
                                @Value("${app.email.from:no-reply@example.invalid}") String from,
                                @Value("${app.frontend-url:http://localhost:8085}") String frontendUrl) {
        this.mailSender = mailSender; this.enabled = enabled; this.from = from; this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    public boolean isEnabled() { return enabled && mailSender.getIfAvailable() != null; }

    public void sendVerification(String email, String token) {
        send(email, "Verify your Ayush NGO account", "Open this verification page and enter the one-time token:\n\n"
                + frontendUrl + "/verify-email.html?token=" + encode(token) + "\n\nThis link expires soon and can only be used once.");
    }

    public void sendPasswordReset(String email, String token) {
        send(email, "Reset your Ayush NGO password", "If you requested a password reset, open this page and enter the one-time token:\n\n"
                + frontendUrl + "/reset-password.html?token=" + encode(token) + "\n\nThis link expires soon and can only be used once.");
    }

    private void send(String email, String subject, String text) {
        if (!isEnabled()) throw ApiException.unavailable("Email delivery is not configured. Set SMTP settings before using account actions.");
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from); message.setTo(email); message.setSubject(subject); message.setText(text);
            mailSender.getObject().send(message);
        } catch (RuntimeException error) {
            throw ApiException.unavailable("Email delivery is temporarily unavailable. Please try again later.");
        }
    }

    private String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
}
