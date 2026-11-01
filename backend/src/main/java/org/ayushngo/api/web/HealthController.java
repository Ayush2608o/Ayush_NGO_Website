package org.ayushngo.api.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/api/health")
    public HealthResponse health() {
        return new HealthResponse(true, "Ayush NGO API is healthy.");
    }

    public record HealthResponse(boolean success, String message) { }
}
