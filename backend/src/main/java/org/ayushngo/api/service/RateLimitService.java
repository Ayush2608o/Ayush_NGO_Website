package org.ayushngo.api.service;

import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {
    private record Window(Instant startedAt, int count) { }
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public boolean allow(String scope, String key, int limit, Duration window) {
        String safeKey = digest(scope + ":" + (key == null ? "unknown" : key));
        Instant now = Instant.now();
        final boolean[] allowed = {false};
        windows.compute(safeKey, (ignored, current) -> {
            if (current == null || current.startedAt().plus(window).isBefore(now)) {
                allowed[0] = true;
                return new Window(now, 1);
            }
            if (current.count() < limit) {
                allowed[0] = true;
                return new Window(current.startedAt(), current.count() + 1);
            }
            return current;
        });
        if (windows.size() > 20_000) windows.entrySet().removeIf(entry -> entry.getValue().startedAt().plus(window.multipliedBy(2)).isBefore(now));
        return allowed[0];
    }

    private String digest(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }
}
