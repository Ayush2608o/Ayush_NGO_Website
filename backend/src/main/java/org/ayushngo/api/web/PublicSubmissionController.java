package org.ayushngo.api.web;

import jakarta.validation.Valid;
import org.ayushngo.api.dto.ApiDtos;
import org.ayushngo.api.model.ContactMessage;
import org.ayushngo.api.model.NewsletterSubscriber;
import org.ayushngo.api.model.VolunteerApplication;
import org.ayushngo.api.repository.ContactMessageRepository;
import org.ayushngo.api.repository.NewsletterRepository;
import org.ayushngo.api.repository.VolunteerApplicationRepository;
import org.ayushngo.api.service.RateLimitService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;

import java.time.Duration;
import java.util.Locale;

@RestController
public class PublicSubmissionController {
    private final ContactMessageRepository contacts;
    private final NewsletterRepository newsletters;
    private final VolunteerApplicationRepository volunteers;
    private final RateLimitService rateLimits;

    public PublicSubmissionController(ContactMessageRepository contacts, NewsletterRepository newsletters,
                                      VolunteerApplicationRepository volunteers, RateLimitService rateLimits) {
        this.contacts = contacts;
        this.newsletters = newsletters;
        this.volunteers = volunteers;
        this.rateLimits = rateLimits;
    }

    @PostMapping("/api/contact")
    public ApiDtos.MessageResponse contact(@Valid @RequestBody ApiDtos.ContactRequest body,
                                            HttpServletRequest request) {
        limit("contact", request, 10);
        if (hasHoneypotValue(body.botField())) return new ApiDtos.MessageResponse(true, "Your message has been received.");
        contacts.save(new ContactMessage(body.name().trim(), normalizeEmail(body.email()),
                trimToNull(body.phone()), body.subject().trim(), body.message().trim()));
        return new ApiDtos.MessageResponse(true, "Your message has been received.");
    }

    @PostMapping("/api/newsletter")
    public ApiDtos.MessageResponse newsletter(@Valid @RequestBody ApiDtos.NewsletterRequest body,
                                               HttpServletRequest request) {
        limit("newsletter", request, 5);
        if (hasHoneypotValue(body.botField())) return new ApiDtos.MessageResponse(true, "Your newsletter signup request has been recorded.");
        String email = normalizeEmail(body.email());
        if (!newsletters.existsByEmail(email)) {
            newsletters.save(new NewsletterSubscriber(email));
        }
        return new ApiDtos.MessageResponse(true, "Your newsletter signup request has been recorded.");
    }

    @PostMapping("/api/volunteer")
    public ApiDtos.MessageResponse volunteer(@Valid @RequestBody ApiDtos.VolunteerRequest body,
                                              HttpServletRequest request) {
        limit("volunteer", request, 5);
        if (hasHoneypotValue(body.botField())) return new ApiDtos.MessageResponse(true, "Your volunteer application has been received.");
        volunteers.save(new VolunteerApplication(body.name().trim(), normalizeEmail(body.email()),
                body.phone().trim(), body.city().trim(), trimToNull(body.state()), body.age(),
                trimToNull(body.occupation()), body.skill().trim(), trimToNull(body.areasOfInterest()),
                trimToNull(body.availability()), trimToNull(body.preference()), trimToNull(body.motivation())));
        return new ApiDtos.MessageResponse(true, "Your volunteer application has been received.");
    }

    private void limit(String scope, HttpServletRequest request, int maxAttempts) {
        if (!rateLimits.allow(scope, request.getRemoteAddr(), maxAttempts, Duration.ofHours(1))) {
            throw org.ayushngo.api.service.ApiException.tooManyRequests("Too many requests. Please try again later.");
        }
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private static boolean hasHoneypotValue(String value) {
        return value != null && !value.isBlank();
    }
}
