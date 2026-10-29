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
import java.util.concurrent.atomic.AtomicInteger;

/**
 * =========================================================================
 * Asha Foundation - Advanced Java REST Server with File Persistence
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
    private static final Path DATA_DIR = Paths.get(System.getenv().getOrDefault("DATA_DIR", "data")).toAbsolutePath().normalize();
    private static final String FRONTEND_ORIGIN = System.getenv().getOrDefault("FRONTEND_ORIGIN", "*");

    // Dynamic stats tracker in memory
    private static final AtomicInteger totalDonationsCount = new AtomicInteger(1420);
    private static final AtomicInteger totalFundsRaised = new AtomicInteger(160000);

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

        // Static Web Files Handler
        server.createContext("/", new StaticFileHandler());

        server.start();

        System.out.println("===============================================================");
        System.out.println(">>> Asha Foundation Advanced NGO Backend is ONLINE!");
        System.out.println(">>> Local Web URL : http://localhost:" + selectedPort + "/index.html");
        System.out.println(">>> All Pages     : http://localhost:" + selectedPort + "/showcase.html");
        System.out.println(">>> Health Check  : http://localhost:" + selectedPort + "/api/health");
        System.out.println(">>> Active Port   : " + selectedPort);
        System.out.println(">>> Persistence   : Saved records written to " + DATA_DIR);
        System.out.println(">>> Press Ctrl + C to stop the server");
        System.out.println("===============================================================");
    }

    private static void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String jsonResponse) throws IOException {
        setCorsHeaders(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }

    private static synchronized void appendToFile(String filename, String data) {
        try {
            Path file = DATA_DIR.resolve(filename);
            String entry = data + System.lineSeparator();
            Files.writeString(file, entry, StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException e) {
            System.err.println("Could not write to file " + filename + ": " + e.getMessage());
        }
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
                  "service": "Asha Foundation Advanced Java Backend",
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
            String json = """
                {
                  "livesImpacted": "100,000+",
                  "schoolsBuilt": "120+",
                  "freeSurgeries": "45k+",
                  "treesPlanted": "250k",
                  "activeVolunteers": "1,200+",
                  "serviceYears": "14+",
                  "totalDonationsCount": %d,
                  "totalFundsRaised": %d
                }
                """.formatted(totalDonationsCount.get(), totalFundsRaised.get());
            sendJsonResponse(exchange, 200, json);
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
                    "raised": 80000,
                    "goal": 100000,
                    "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
                  },
                  {
                    "id": "mobile-health-vans",
                    "title": "Mobile Health Vans",
                    "category": "Healthcare",
                    "description": "Equipped medical vans bringing free doctor consultations and medicines to remote villages.",
                    "raised": 45000,
                    "goal": 75000,
                    "image": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
                  },
                  {
                    "id": "clean-earth-drive",
                    "title": "Clean Earth Drive",
                    "category": "Environment",
                    "description": "Planting native trees, restoring polluted water bodies, and advocating plastic-free urban areas.",
                    "raised": 35000,
                    "goal": 40000,
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
                    "title": "Annual Winter Relief Drive Launched Across 50 Districts",
                                        "excerpt": "Providing blankets, warm clothing, and hot meals to thousands of shelterless people during winter.",
                                        "details": "Local partner groups are distributing thermal kits and serving hot meals at community shelters across 50 districts. The drive focuses on reaching families and people without stable housing before the coldest weeks of winter."
                  },
                  {
                    "id": 2,
                    "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
                    "meta": "EDUCATION • SEP 2026",
                    "title": "New Computer Lab Opened in Rural High School",
                                        "excerpt": "Over 400 rural students now have daily access to high-speed internet and basic computer education.",
                                        "details": "The new lab has 30 computers, internet access and solar power backup. Teachers will use it for introductory digital literacy lessons, research projects and practical computer skills for students across the school."
                                    },
                                    {
                                        "id": 3,
                                        "image": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
                                        "meta": "HEALTHCARE • AUG 2026",
                                        "title": "1,200 Free Vision Care Camps Conducted",
                                        "excerpt": "Restoring vision and independence to residents in remote villages through screenings, eyeglasses and referrals.",
                                        "details": "Mobile ophthalmology teams screened more than 5,000 residents during the campaign. People needing further care received eyeglasses or referrals for follow-up treatment, including cataract surgery."
                                    },
                                    {
                                        "id": 4,
                                        "image": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
                                        "meta": "ENVIRONMENT • JUL 2026",
                                        "title": "Community Rainwater Harvesting Unit Installed",
                                        "excerpt": "A new local storage unit helps communities conserve seasonal rainwater for household and agricultural use.",
                                        "details": "The harvesting unit can store up to 100,000 liters of seasonal rainwater. Community volunteers are helping maintain the system and monitor stored water so it can support household needs and small-scale farming through drier months."
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
            String json = """
                [
                  {"name": "Priya S.", "amount": 50, "cause": "Shiksha Mission 2026", "time": "2 mins ago"},
                  {"name": "Rahul V.", "amount": 100, "cause": "Mobile Health Vans", "time": "5 mins ago"},
                  {"name": "Ananya D.", "amount": 35, "cause": "Clean Earth Drive", "time": "8 mins ago"}
                ]
                """;
            sendJsonResponse(exchange, 200, json);
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

            String body = readRequestBody(exchange);
            System.out.println("[JAVA BACKEND] Contact Message Received: " + body);
            appendToFile("contacts.jsonl", body);

            String json = """
                {
                  "success": true,
                  "message": "Thank you! Your message has been received by Asha Foundation headquarters. Our team will contact you within 24 hours.",
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

            String body = readRequestBody(exchange);
            System.out.println("[JAVA BACKEND] Donation Received: " + body);
            appendToFile("donations.jsonl", body);

                        String requestId = "ASHA-" + UUID.randomUUID();

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

            String body = readRequestBody(exchange);
            System.out.println("[JAVA BACKEND] Volunteer Application: " + body);
            appendToFile("volunteers.jsonl", body);

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

            String body = readRequestBody(exchange);
            if (!body.matches("(?s).*\\\"email\\\"\\s*:\\s*\\\"[^\\\"\\s@]+@[^\\\"\\s@]+\\.[^\\\"\\s@]+\\\".*")) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Enter a valid email address.\"}");
                return;
            }

            appendToFile("newsletter.jsonl", body);
            sendJsonResponse(exchange, 201, "{\"success\":true,\"message\":\"You are subscribed to Asha Foundation updates.\"}");
        }
    }

    // 10. Static File Server Handler
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String pathStr = exchange.getRequestURI().getPath();
            if (pathStr.equals("/") || pathStr.isEmpty()) {
                pathStr = "/index.html";
            }

            if (pathStr.startsWith("/")) {
                pathStr = pathStr.substring(1);
            }

            Path requestedFile = WEB_ROOT.resolve(pathStr).normalize();

            if (!requestedFile.startsWith(WEB_ROOT) || !Files.exists(requestedFile) || Files.isDirectory(requestedFile)) {
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
            byte[] fileBytes = Files.readAllBytes(requestedFile);
            exchange.sendResponseHeaders(200, fileBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        }
    }
}
