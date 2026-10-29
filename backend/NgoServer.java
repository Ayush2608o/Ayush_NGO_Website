package backend;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ConcurrentHashMap;
import java.security.SecureRandom;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.List;
import java.util.HexFormat;
import java.util.Locale;
import java.net.URI;

/**
 * =========================================================================
 * Ayush NGO - Advanced Java REST Server with File Persistence
 * =========================================================================
 * - Standards: Java SE 17 / 21 / 27
 * - Features:
 *   1. Full CORS Support for frontend & cross-port access
 *   2. Endpoints:
 *      - GET  /api/health
 *      - GET  /api/stats
 *      - GET  /api/projects
 *      - GET  /api/news
 *      - GET  /api/donations/recent
 *      - POST /api/contact      (Saves to data/contacts.json)
 *      - POST /api/donate       (Saves to data/donations.json)
 *      - POST /api/volunteer    (Saves to data/volunteers.json)
 *   3. Embedded Static File Server (Direct hosting at http://localhost:PORT)
 * =========================================================================
 */
public class NgoServer {

    private static final Path WEB_ROOT = Paths.get(".").toAbsolutePath().normalize();
    private static final Path DATA_DIR = Paths.get(System.getenv().getOrDefault(
            "DATA_DIR", Paths.get(System.getProperty("user.home"), ".ayush-ngo-data").toString())).toAbsolutePath().normalize();
    private static final String FRONTEND_ORIGIN = System.getenv().getOrDefault("FRONTEND_ORIGIN", "http://localhost:8080");
    private static final int MAX_REQUEST_BYTES = 16_384;
    private static final Map<String, AuthSession> AUTH_SESSIONS = new ConcurrentHashMap<>();
    private static final SecureRandom AUTH_RANDOM = new SecureRandom();

    public static void main(String[] args) throws IOException {
        // Ensure data directory exists
        if (!Files.exists(DATA_DIR)) {
            Files.createDirectories(DATA_DIR);
        }

        int selectedPort = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", selectedPort), 0);

        server.setExecutor(Executors.newFixedThreadPool(16));

        // Register REST API Endpoints
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/stats", new StatsHandler());
        server.createContext("/api/projects", new ProjectsHandler());
        server.createContext("/api/news", new NewsHandler());
        server.createContext("/api/donations/recent", new RecentDonationsHandler());
        server.createContext("/api/contact", new ContactHandler());
        server.createContext("/api/donate", new DonateHandler());
        server.createContext("/api/volunteer", new VolunteerHandler());
        server.createContext("/api/newsletter", new NewsletterHandler());
        server.createContext("/api/auth", new AuthHandler());
        server.createContext("/api/profile", new AuthHandler());
        server.createContext("/api/donations", new AuthHandler());

        // Static Web Files Handler
        server.createContext("/", new StaticFileHandler());

        server.start();

        System.out.println("===============================================================");
        System.out.println(">>> Ayush NGO Advanced NGO Backend is ONLINE!");
        System.out.println(">>> Local Web URL : http://localhost:" + selectedPort + "/index.html");
        System.out.println(">>> All Pages     : http://localhost:" + selectedPort + "/showcase.html");
        System.out.println(">>> Health Check  : http://localhost:" + selectedPort + "/api/health");
        System.out.println(">>> Active Port   : " + selectedPort);
        System.out.println(">>> Persistence   : Saved records written to " + DATA_DIR);
        System.out.println(">>> Press Ctrl + C to stop the server");
        System.out.println("===============================================================");
    }

    private static void setCorsHeaders(HttpExchange exchange) {
        String origin = exchange.getRequestHeaders().getFirst("Origin");
        if (origin != null && (origin.equals(FRONTEND_ORIGIN) || origin.equals("http://localhost:8085") || isLocalDevelopmentOrigin(origin))) {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", origin);
            exchange.getResponseHeaders().set("Vary", "Origin");
            exchange.getResponseHeaders().set("Access-Control-Allow-Credentials", "true");
        }
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-XSRF-TOKEN");
    }

    private static boolean isLocalDevelopmentOrigin(String origin) {
        try {
            URI uri = URI.create(origin);
            String host = uri.getHost();
            return "http".equalsIgnoreCase(uri.getScheme()) && uri.getPort() > 0 && host != null
                    && (host.equalsIgnoreCase("localhost") || host.equals("127.0.0.1") || host.equals("::1"));
        } catch (IllegalArgumentException ignored) { return false; }
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String jsonResponse) throws IOException {
        setCorsHeaders(exchange);
        exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        exchange.getResponseHeaders().set("Referrer-Policy", "strict-origin-when-cross-origin");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream body = exchange.getRequestBody()) {
            byte[] bytes = body.readNBytes(MAX_REQUEST_BYTES + 1);
            if (bytes.length > MAX_REQUEST_BYTES) throw new IOException("Request body too large");
            return new String(bytes, StandardCharsets.UTF_8);
        }
    }

    private static boolean isJsonRequest(HttpExchange exchange) {
        String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
        return contentType != null && contentType.toLowerCase().startsWith("application/json");
    }

    private static synchronized boolean appendToFile(String filename, String data) {
        try {
            Path file = DATA_DIR.resolve(filename);
            String entry = data + System.lineSeparator();
            Files.writeString(file, entry, StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            return true;
        } catch (IOException e) {
            System.err.println("Could not write submission to storage.");
            return false;
        }
    }

    private static String jsonString(String body, String field) {
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile(
                "\\\"" + java.util.regex.Pattern.quote(field) + "\\\"\\s*:\\s*\\\"((?:\\\\.|[^\\\"\\\\])*)\\\"").matcher(body);
        return matcher.find() ? unescapeJson(matcher.group(1)).trim() : null;
    }

    private static String unescapeJson(String value) {
        StringBuilder result = new StringBuilder(value.length());
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (c != '\\' || i + 1 >= value.length()) { result.append(c); continue; }
            char escaped = value.charAt(++i);
            switch (escaped) {
                case '"' -> result.append('"'); case '\\' -> result.append('\\'); case '/' -> result.append('/');
                case 'b' -> result.append('\b'); case 'f' -> result.append('\f'); case 'n' -> result.append('\n');
                case 'r' -> result.append('\r'); case 't' -> result.append('\t');
                case 'u' -> { if (i + 4 >= value.length()) throw new IllegalArgumentException("Invalid JSON escape"); result.append((char) Integer.parseInt(value.substring(i + 1, i + 5), 16)); i += 4; }
                default -> throw new IllegalArgumentException("Invalid JSON escape");
            }
        }
        return result.toString();
    }

    private static boolean validEmail(String email) {
        return email != null && email.length() <= 254 && email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    }

    private static boolean validField(String body, String field, int min, int max) {
        String value = jsonString(body, field);
        return value != null && value.length() >= min && value.length() <= max;
    }

    private static String jsonNumber(String body, String field) {
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile(
                "\\\"" + java.util.regex.Pattern.quote(field) + "\\\"\\s*:\\s*(-?[0-9]+(?:\\.[0-9]+)?)").matcher(body);
        return matcher.find() ? matcher.group(1) : null;
    }

    private static boolean validJsonObject(String body) {
        return body != null && body.trim().startsWith("{") && body.trim().endsWith("}");
    }

    // 1. Health Handler
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                setCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String json = """
                {
                  "status": "UP",
                  "service": "Ayush NGO Advanced Java Backend",
                  "version": "2.0.0",
                  "timestamp": "%s"
                }
                """.formatted(Instant.now());
            sendJsonResponse(exchange, 200, json);
        }
    }

    // 2. Stats Handler
    static class StatsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                setCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            sendJsonResponse(exchange, 200, "{\"available\":false,\"message\":\"Verified impact data has not been configured.\"}");
        }
    }

    // 3. Projects Handler
    static class ProjectsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                setCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String json = """
                [
                  {
                    "id": "shiksha-2026",
                    "title": "Shiksha Mission 2026",
                    "category": "Education",
                    "description": "Providing digital classrooms, free uniforms, and nutritious midday meals to remote rural schools.",
                    "sampleData": true,
                    "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
                  },
                  {
                    "id": "mobile-health-vans",
                    "title": "Mobile Health Vans",
                    "category": "Healthcare",
                    "description": "Equipped medical vans bringing free doctor consultations and medicines to remote villages.",
                    "sampleData": true,
                    "image": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
                  },
                  {
                    "id": "clean-earth-drive",
                    "title": "Clean Earth Drive",
                    "category": "Environment",
                    "description": "Planting native trees, restoring polluted water bodies, and advocating plastic-free urban areas.",
                    "sampleData": true,
                    "image": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
                  }
                ]
                """;
            sendJsonResponse(exchange, 200, json);
        }
    }

    // 4. News Handler
    static class NewsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                setCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String json = """
                [
                  {
                    "id": 1,
                    "badge": "News 1",
                    "meta": "PRESS RELEASE • OCT 2026",
                    "title": "Winter Relief Program Update",
                                        "excerpt": "An illustrative update about community support during winter.",
                                        "details": "This sample article is placeholder content and should be replaced with a verified update before publication.",
                                        "sampleData": true
                  },
                  {
                    "id": 2,
                    "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
                    "meta": "EDUCATION • SEP 2026",
                    "title": "New Computer Lab Opened in Rural High School",
                                        "excerpt": "An illustrative update about expanding access to digital learning.",
                                        "details": "This sample article is placeholder content and should be replaced with a verified update before publication.",
                                        "sampleData": true
                                    },
                                    {
                                        "id": 3,
                                        "image": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
                                        "meta": "HEALTHCARE • AUG 2026",
                                        "title": "Community Vision Care Program",
                                        "excerpt": "An illustrative update about community health services.",
                                        "details": "This sample article is placeholder content and should be replaced with a verified update before publication.",
                                        "sampleData": true
                                    },
                                    {
                                        "id": 4,
                                        "image": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
                                        "meta": "ENVIRONMENT • JUL 2026",
                                        "title": "Community Rainwater Harvesting Unit Installed",
                                        "excerpt": "An illustrative update about community-led water conservation.",
                                        "details": "This sample article is placeholder content and should be replaced with a verified update before publication.",
                                        "sampleData": true
                  }
                ]
                """;
            sendJsonResponse(exchange, 200, json);
        }
    }

    // 5. Recent Donations Handler
    static class RecentDonationsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                setCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            sendJsonResponse(exchange, 200, "[]");
        }
    }

    // 6. Contact Form Handler (POST /api/contact)
    static class ContactHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                setCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            String body;
            try { body = readRequestBody(exchange); }
            catch (IOException e) { sendJsonResponse(exchange, 413, "{\"success\":false,\"message\":\"Submission is too large.\"}"); return; }
            if (!isJsonRequest(exchange) || !validJsonObject(body) || !validEmail(jsonString(body, "email"))
                    || !validField(body, "name", 1, 120) || !validField(body, "subject", 1, 200)
                    || !validField(body, "message", 1, 4000)) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Enter a valid name, email, and message.\"}"); return;
            }
            if (!appendToFile("contacts.jsonl", body)) { sendJsonResponse(exchange, 500, "{\"success\":false,\"message\":\"Message storage is unavailable. Please try again later.\"}"); return; }

            String json = """
                {
                  "success": true,
                  "message": "Your message has been recorded.",
                  "timestamp": "%s"
                }
                """.formatted(Instant.now());

            sendJsonResponse(exchange, 200, json);
        }
    }

    // 7. Donation Handler (POST /api/donate)
    static class DonateHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                setCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            String body;
            try { body = readRequestBody(exchange); }
            catch (IOException e) { sendJsonResponse(exchange, 413, "{\"success\":false,\"message\":\"Submission is too large.\"}"); return; }
            String amountText = jsonNumber(body, "amount");
            double amount;
            try { amount = Double.parseDouble(amountText); }
            catch (RuntimeException e) { sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Enter a valid donation amount.\"}"); return; }
            if (!isJsonRequest(exchange) || !validJsonObject(body) || !Double.isFinite(amount) || amount < 5 || amount > 1_000_000 || amount % 5 != 0
                    || !validEmail(jsonString(body, "donorEmail")) || !validField(body, "donorName", 1, 120)
                    || !"one-time".equals(jsonString(body, "frequency")) && !"monthly".equals(jsonString(body, "frequency"))
                    || !"USD".equals(jsonString(body, "currency")) && !"INR".equals(jsonString(body, "currency"))) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Donation request details are invalid.\"}"); return;
            }
            String requestId = "AYUSH-" + UUID.randomUUID();
            String recordedAt = Instant.now().toString();
            String storedRecord = body.trim().substring(0, body.trim().length() - 1)
                    + ",\"requestId\":\"" + requestId + "\",\"status\":\"PENDING_PAYMENT\",\"timestamp\":\"" + recordedAt + "\"}";
            if (!appendToFile("donations.jsonl", storedRecord)) { sendJsonResponse(exchange, 500, "{\"success\":false,\"message\":\"Donation request storage is unavailable. Please try again later.\"}"); return; }

            String json = """
                {
                  "success": true,
                                    "requestId": "%s",
                                    "message": "Your donation request has been recorded. No payment has been collected.",
                                    "status": "PENDING_PAYMENT",
                  "timestamp": "%s"
                }
                                """.formatted(requestId, Instant.now());

            sendJsonResponse(exchange, 200, json);
        }
    }

    // 8. Volunteer Handler (POST /api/volunteer)
    static class VolunteerHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                setCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            String body;
            try { body = readRequestBody(exchange); }
            catch (IOException e) { sendJsonResponse(exchange, 413, "{\"success\":false,\"message\":\"Submission is too large.\"}"); return; }
            if (!isJsonRequest(exchange) || !validJsonObject(body) || !validEmail(jsonString(body, "email"))
                    || !validField(body, "name", 1, 120) || !validField(body, "phone", 5, 40)
                    || !validField(body, "city", 1, 120)) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Enter valid volunteer contact details.\"}"); return;
            }
            if (!appendToFile("volunteers.jsonl", body)) { sendJsonResponse(exchange, 500, "{\"success\":false,\"message\":\"Application storage is unavailable. Please try again later.\"}"); return; }

            String json = """
                {
                  "success": true,
                  "message": "Welcome to our volunteer community! We have received your application.",
                  "timestamp": "%s"
                }
                """.formatted(Instant.now());

            sendJsonResponse(exchange, 200, json);
        }
    }

    // 9. Newsletter Subscription Handler
    static class NewsletterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                setCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"success\":false,\"message\":\"Method Not Allowed\"}");
                return;
            }

            String body;
            try { body = readRequestBody(exchange); }
            catch (IOException e) { sendJsonResponse(exchange, 413, "{\"success\":false,\"message\":\"Submission is too large.\"}"); return; }
            if (!isJsonRequest(exchange) || !validJsonObject(body) || !validEmail(jsonString(body, "email"))) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Enter a valid email address.\"}");
                return;
            }

            if (!appendToFile("newsletter.jsonl", body)) { sendJsonResponse(exchange, 500, "{\"success\":false,\"message\":\"Subscription storage is unavailable. Please try again later.\"}"); return; }
            sendJsonResponse(exchange, 201, "{\"success\":true,\"message\":\"Your newsletter signup request has been recorded.\"}");
        }
    }

    private record AuthSession(String email, String csrf, long expiresAt) { }
    private record Account(String email, String fullName, String phone, String address, byte[] salt, byte[] passwordHash) { }

    static class AuthHandler implements HttpHandler {
        private static final int PASSWORD_ITERATIONS = 210_000;
        private static final Path ACCOUNT_FILE = DATA_DIR.resolve("accounts.tsv");

        @Override public void handle(HttpExchange exchange) throws IOException {
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            if ("OPTIONS".equalsIgnoreCase(method)) { setCorsHeaders(exchange); exchange.sendResponseHeaders(204, -1); return; }
            if ("GET".equalsIgnoreCase(method) && path.equals("/api/auth/csrf")) { csrf(exchange); return; }
            if ("GET".equalsIgnoreCase(method) && path.equals("/api/auth/options")) { sendJsonResponse(exchange, 200, "{\"success\":true,\"googleEnabled\":false}"); return; }
            if ("GET".equalsIgnoreCase(method) && path.equals("/api/auth/me")) { me(exchange); return; }
            if ("GET".equalsIgnoreCase(method) && path.equals("/api/profile/me")) { profile(exchange); return; }
            if ("GET".equalsIgnoreCase(method) && (path.equals("/api/donations/me") || path.equals("/api/donations/me/summary"))) { donations(exchange, path); return; }

            if (!("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method))) { sendJsonResponse(exchange, 405, "{\"success\":false,\"message\":\"Method not allowed.\"}"); return; }
            AuthSession session = session(exchange);
            if (session == null || session.expiresAt() < System.currentTimeMillis()
                    || !session.csrf().equals(exchange.getRequestHeaders().getFirst("X-XSRF-TOKEN"))) {
                sendJsonResponse(exchange, 403, "{\"success\":false,\"message\":\"Session expired. Refresh and try again.\"}"); return;
            }
            String body;
            try { body = readRequestBody(exchange); }
            catch (IOException e) { sendJsonResponse(exchange, 413, "{\"success\":false,\"message\":\"Request is too large.\"}"); return; }
            if (!isJsonRequest(exchange) || !validJsonObject(body)) { sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Invalid request.\"}"); return; }
            if (path.equals("/api/auth/register") && "POST".equalsIgnoreCase(method)) { register(exchange, body); return; }
            if (path.equals("/api/auth/login") && "POST".equalsIgnoreCase(method)) { login(exchange, body, session); return; }
            if (path.equals("/api/auth/logout") && "POST".equalsIgnoreCase(method)) { logout(exchange); return; }
            if (path.equals("/api/profile/me") && "PUT".equalsIgnoreCase(method)) { updateProfile(exchange, body, session); return; }
            sendJsonResponse(exchange, 404, "{\"success\":false,\"message\":\"Account endpoint not found.\"}");
        }

        private void csrf(HttpExchange ex) throws IOException {
            String id = cookie(ex, "AYUSH_SESSION");
            AuthSession old = id == null ? null : AUTH_SESSIONS.get(id);
            if (old == null || old.expiresAt() < System.currentTimeMillis()) {
                id = randomToken(); old = new AuthSession(null, randomToken(), System.currentTimeMillis() + 30 * 60_000L);
                AUTH_SESSIONS.put(id, old);
                ex.getResponseHeaders().add("Set-Cookie", "AYUSH_SESSION=" + id + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800");
            }
            sendJsonResponse(ex, 200, "{\"success\":true,\"token\":" + quote(old.csrf()) + "}");
        }

        private void me(HttpExchange ex) throws IOException {
            AuthSession s = session(ex);
            if (s == null || s.email() == null || s.expiresAt() < System.currentTimeMillis()) { sendJsonResponse(ex, 401, "{\"success\":false,\"message\":\"Sign in to continue.\"}"); return; }
            Account a = find(s.email());
            if (a == null) { sendJsonResponse(ex, 401, "{\"success\":false,\"message\":\"Sign in to continue.\"}"); return; }
            sendJsonResponse(ex, 200, "{\"success\":true,\"user\":" + userJson(a) + "}");
        }

        private void profile(HttpExchange ex) throws IOException { me(ex); }

        private void donations(HttpExchange ex, String path) throws IOException {
            AuthSession s = session(ex);
            if (s == null || s.email() == null || s.expiresAt() < System.currentTimeMillis()) { sendJsonResponse(ex, 401, "{\"success\":false,\"message\":\"Sign in to view donation history.\"}"); return; }
            Account account = find(s.email());
            if (account == null) { sendJsonResponse(ex, 401, "{\"success\":false,\"message\":\"Sign in to view donation history.\"}"); return; }
            List<DonationRecord> records = accountDonations(account.email());
            if (path.endsWith("/summary")) { sendJsonResponse(ex, 200, donationSummary(records)); return; }
            String items = records.stream().map(DonationRecord::json).collect(java.util.stream.Collectors.joining(","));
            sendJsonResponse(ex, 200, "{\"success\":true,\"items\":[" + items + "]}");
        }

        private record DonationRecord(String json, String status, String currency, java.math.BigDecimal amount, java.time.Instant createdAt) { }

        private static List<DonationRecord> accountDonations(String email) {
            List<DonationRecord> records = new java.util.ArrayList<>();
            Path file = DATA_DIR.resolve("donations.jsonl");
            if (!Files.exists(file)) return records;
            try {
                for (String line : Files.readAllLines(file, StandardCharsets.UTF_8)) {
                    try {
                        if (!email.equalsIgnoreCase(jsonString(line, "donorEmail"))) continue;
                        String currency = jsonString(line, "currency");
                        String frequency = jsonString(line, "frequency");
                        String cause = jsonString(line, "cause");
                        String requestId = jsonString(line, "requestId");
                        String status = jsonString(line, "status");
                        java.math.BigDecimal amount = new java.math.BigDecimal(jsonNumber(line, "amount"));
                        java.time.Instant createdAt;
                        try { createdAt = java.time.Instant.parse(jsonString(line, "timestamp")); } catch (Exception ignored) { createdAt = java.time.Instant.EPOCH; }
                        String item = "{\"id\":" + quote(requestId == null ? "" : requestId) + ",\"createdAt\":" + quote(createdAt.toString())
                                + ",\"projectName\":" + quote(cause == null ? "General" : cause) + ",\"amount\":" + amount.toPlainString()
                                + ",\"currency\":" + quote(currency == null ? "INR" : currency) + ",\"frequency\":" + quote(frequency == null ? "one-time" : frequency)
                                + ",\"status\":" + quote(status == null ? "PENDING_PAYMENT" : status) + "}";
                        records.add(new DonationRecord(item, status == null ? "PENDING_PAYMENT" : status, currency == null ? "INR" : currency, amount, createdAt));
                    } catch (RuntimeException ignored) { /* Skip malformed or legacy donation rows. */ }
                }
            } catch (IOException e) { System.err.println("Could not read donation history."); }
            records.sort(java.util.Comparator.comparing(DonationRecord::createdAt).reversed());
            return records;
        }

        private static String donationSummary(List<DonationRecord> records) {
            Map<String, java.math.BigDecimal> totals = new java.util.TreeMap<>();
            Map<String, java.math.BigDecimal> monthly = new java.util.TreeMap<>();
            List<DonationRecord> successful = records.stream().filter(r -> "SUCCEEDED".equalsIgnoreCase(r.status())).toList();
            for (DonationRecord r : successful) {
                totals.merge(r.currency(), r.amount(), java.math.BigDecimal::add);
                String month = r.createdAt().atZone(java.time.ZoneOffset.UTC).toLocalDate().withDayOfMonth(1).toString().substring(0, 7);
                monthly.merge(month + "|" + r.currency(), r.amount(), java.math.BigDecimal::add);
            }
            String totalJson = totals.entrySet().stream().map(e -> "{\"currency\":" + quote(e.getKey()) + ",\"total\":" + e.getValue().toPlainString() + "}").collect(java.util.stream.Collectors.joining(","));
            String monthlyJson = monthly.entrySet().stream().map(e -> { String[] key = e.getKey().split("\\|", 2); return "{\"month\":" + quote(key[0]) + ",\"currency\":" + quote(key[1]) + ",\"total\":" + e.getValue().toPlainString() + "}"; }).collect(java.util.stream.Collectors.joining(","));
            DonationRecord recent = successful.isEmpty() ? null : successful.get(0);
            return "{\"success\":true,\"successfulTotals\":[" + totalJson + "],\"successfulCount\":" + successful.size()
                    + ",\"mostRecentAmount\":" + (recent == null ? "null" : quote(recent.amount().toPlainString()))
                    + ",\"mostRecentCurrency\":" + (recent == null ? "null" : quote(recent.currency()))
                    + ",\"mostRecentAt\":" + (recent == null ? "null" : quote(recent.createdAt().toString())) + ",\"monthly\":[" + monthlyJson + "]}";
        }

        private void register(HttpExchange ex, String body) throws IOException {
            String email = norm(jsonString(body, "email"));
            String name = jsonString(body, "fullName");
            String phone = jsonString(body, "phone");
            String password = jsonString(body, "password");
            if (!validEmail(email) || name == null || name.isBlank() || name.length() > 120 || password == null
                    || !password.matches("(?s)(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{12,72}")) {
                sendJsonResponse(ex, 400, "{\"success\":false,\"message\":\"Use a valid name and email, and a password with 12+ characters, uppercase, lowercase, a number, and a symbol.\"}"); return;
            }
            synchronized (AuthHandler.class) {
                if (find(email) != null) { sendJsonResponse(ex, 409, "{\"success\":false,\"message\":\"An account with this email already exists. Sign in instead.\"}"); return; }
                byte[] salt = new byte[16]; AUTH_RANDOM.nextBytes(salt);
                Account account = new Account(email, name.trim(), phone == null ? "" : phone, "", salt, derive(password.toCharArray(), salt));
                if (!save(account)) { sendJsonResponse(ex, 500, "{\"success\":false,\"message\":\"Could not save your account. Try again.\"}"); return; }
            }
            sendJsonResponse(ex, 201, "{\"success\":true,\"message\":\"Account created. You can now sign in with your email and password.\"}");
        }

        private void login(HttpExchange ex, String body, AuthSession session) throws IOException {
            String email = norm(jsonString(body, "email"));
            String password = jsonString(body, "password");
            Account a = find(email);
            if (a == null || password == null || !java.security.MessageDigest.isEqual(a.passwordHash(), derive(password.toCharArray(), a.salt()))) {
                sendJsonResponse(ex, 401, "{\"success\":false,\"message\":\"Email or password is incorrect.\"}"); return;
            }
            String id = cookie(ex, "AYUSH_SESSION");
            if (id == null) id = randomToken();
            AUTH_SESSIONS.put(id, new AuthSession(a.email(), session.csrf(), System.currentTimeMillis() + 30 * 60_000L));
            ex.getResponseHeaders().add("Set-Cookie", "AYUSH_SESSION=" + id + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800");
            sendJsonResponse(ex, 200, "{\"success\":true,\"user\":" + userJson(a) + "}");
        }

        private void logout(HttpExchange ex) throws IOException {
            String id = cookie(ex, "AYUSH_SESSION"); if (id != null) AUTH_SESSIONS.remove(id);
            ex.getResponseHeaders().add("Set-Cookie", "AYUSH_SESSION=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
            sendJsonResponse(ex, 200, "{\"success\":true,\"message\":\"Signed out.\"}");
        }

        private void updateProfile(HttpExchange ex, String body, AuthSession s) throws IOException {
            Account old = find(s.email());
            String name = jsonString(body, "fullName");
            if (old == null || name == null || name.isBlank() || name.length() > 120) { sendJsonResponse(ex, 400, "{\"success\":false,\"message\":\"Enter a valid name.\"}"); return; }
            Account next = new Account(old.email(), name.trim(), safe(jsonString(body, "phone")), safe(jsonString(body, "address")), old.salt(), old.passwordHash());
            synchronized (AuthHandler.class) {
                try {
                    List<String> lines = Files.exists(ACCOUNT_FILE) ? Files.readAllLines(ACCOUNT_FILE, StandardCharsets.UTF_8) : new java.util.ArrayList<>();
                    String replacement = encode(next);
                    for (int i = 0; i < lines.size(); i++) {
                        try { if (decode(lines.get(i)).email().equals(old.email())) { lines.set(i, replacement); break; } }
                        catch (RuntimeException ignored) { /* Ignore blank or damaged legacy rows. */ }
                    }
                    Files.write(ACCOUNT_FILE, lines, StandardCharsets.UTF_8);
                } catch (Exception e) { sendJsonResponse(ex, 500, "{\"success\":false,\"message\":\"Could not save profile.\"}"); return; }
            }
            sendJsonResponse(ex, 200, "{\"success\":true,\"user\":" + userJson(next) + "}");
        }

        private static AuthSession session(HttpExchange ex) { String id = cookie(ex, "AYUSH_SESSION"); return id == null ? null : AUTH_SESSIONS.get(id); }
        private static String cookie(HttpExchange ex, String name) {
            String header = ex.getRequestHeaders().getFirst("Cookie"); if (header == null) return null;
            for (String part : header.split(";")) { String[] pair = part.trim().split("=", 2); if (pair.length == 2 && pair[0].equals(name)) return pair[1]; }
            return null;
        }
        private static String randomToken() { byte[] b = new byte[32]; AUTH_RANDOM.nextBytes(b); return Base64.getUrlEncoder().withoutPadding().encodeToString(b); }
        private static byte[] derive(char[] password, byte[] salt) {
            try { PBEKeySpec spec = new PBEKeySpec(password, salt, PASSWORD_ITERATIONS, 256); byte[] key = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded(); spec.clearPassword(); java.util.Arrays.fill(password, '\0'); return key; }
            catch (Exception e) { throw new IllegalStateException("Password hashing is unavailable", e); }
        }
        private static synchronized Account find(String email) {
            if (email == null) return null;
            try { if (!Files.exists(ACCOUNT_FILE)) return null; for (String line : Files.readAllLines(ACCOUNT_FILE, StandardCharsets.UTF_8)) { if (line == null || line.isBlank()) continue; try { Account a = decode(line); if (a.email().equals(email)) return a; } catch (RuntimeException ignored) { /* Continue past a damaged row. */ } } }
            catch (Exception e) { System.err.println("Could not read local account store."); }
            return null;
        }
        private static boolean save(Account a) { try { Files.createDirectories(DATA_DIR); Files.writeString(ACCOUNT_FILE, encode(a) + System.lineSeparator(), StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND); return true; } catch (IOException e) { return false; } }
        private static String encode(Account a) { return String.join("\t", b64(a.email()), b64(a.fullName()), b64(a.phone()), b64(a.address()), HexFormat.of().formatHex(a.salt()), HexFormat.of().formatHex(a.passwordHash())); }
        private static Account decode(String line) { String[] p = line.replaceFirst("^\\uFEFF", "").split("\\t", -1); if (p.length != 6) throw new IllegalArgumentException("Invalid account row"); return new Account(unb64(p[0]), unb64(p[1]), unb64(p[2]), unb64(p[3]), HexFormat.of().parseHex(p[4]), HexFormat.of().parseHex(p[5])); }
        private static String b64(String v) { return Base64.getUrlEncoder().withoutPadding().encodeToString(safe(v).getBytes(StandardCharsets.UTF_8)); }
        private static String unb64(String v) { return new String(Base64.getUrlDecoder().decode(v), StandardCharsets.UTF_8); }
        private static String safe(String s) { return s == null ? "" : s.trim(); }
        private static String norm(String s) { return s == null ? null : s.trim().toLowerCase(Locale.ROOT); }
        private static String userJson(Account a) { return "{\"email\":" + quote(a.email()) + ",\"fullName\":" + quote(a.fullName()) + ",\"phone\":" + quote(a.phone()) + ",\"address\":" + quote(a.address()) + ",\"emailVerified\":true}"; }
        private static String quote(String s) { return "\"" + safe(s).replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r") + "\""; }

    }

    // 10. Static File Server Handler
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"success\":false,\"message\":\"Method Not Allowed\"}");
                return;
            }
            String pathStr = exchange.getRequestURI().getPath();
            if (pathStr.equals("/") || pathStr.isEmpty()) {
                pathStr = "/index.html";
            }

            if (pathStr.startsWith("/")) {
                pathStr = pathStr.substring(1);
            }

            Path requestedFile = WEB_ROOT.resolve(pathStr).normalize();
            String relativePath = WEB_ROOT.relativize(requestedFile).toString().replace('\\', '/');
            boolean allowedPath = relativePath.matches("[A-Za-z0-9._-]+\\.html")
                    || relativePath.matches("css/[A-Za-z0-9._-]+\\.css")
                    || relativePath.matches("js/[A-Za-z0-9._-]+\\.js");

            if (!allowedPath || !requestedFile.startsWith(WEB_ROOT) || !Files.exists(requestedFile) || Files.isDirectory(requestedFile)) {
                String notFound = "<h1>404 Not Found</h1><p>The requested file does not exist.</p>";
                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                exchange.sendResponseHeaders(404, notFound.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(notFound.getBytes(StandardCharsets.UTF_8));
                }
                return;
            }

            String mimeType = Files.probeContentType(requestedFile);
            if (mimeType == null) {
                if (pathStr.endsWith(".css")) mimeType = "text/css";
                else if (pathStr.endsWith(".js")) mimeType = "application/javascript";
                else if (pathStr.endsWith(".html")) mimeType = "text/html";
                else mimeType = "application/octet-stream";
            }

            exchange.getResponseHeaders().set("Content-Type", mimeType + "; charset=UTF-8");
            exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
            exchange.getResponseHeaders().set("Referrer-Policy", "strict-origin-when-cross-origin");
            byte[] fileBytes = Files.readAllBytes(requestedFile);
            exchange.sendResponseHeaders(200, fileBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        }
    }
}
