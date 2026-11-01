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
import java.util.concurrent.Executors;

/**
 * =========================================================================
 * Ayush NGO - Legacy Java REST Server with File Persistence
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

    private static final int[] CANDIDATE_PORTS = {8080, 8085, 9090, 8000, 5000};
    private static final Path WEB_ROOT = Paths.get(".").toAbsolutePath().normalize();
    private static final Path DATA_DIR = WEB_ROOT.resolve("data");

    public static void main(String[] args) throws IOException {
        // Ensure data directory exists
        if (!Files.exists(DATA_DIR)) {
            Files.createDirectories(DATA_DIR);
        }

        int selectedPort = 8080;
        HttpServer server = null;

        for (int p : CANDIDATE_PORTS) {
            try {
                server = HttpServer.create(new InetSocketAddress(p), 0);
                selectedPort = p;
                break;
            } catch (java.net.BindException ex) {
                System.out.println("Port " + p + " is occupied, trying next candidate...");
            }
        }

        if (server == null) {
            server = HttpServer.create(new InetSocketAddress(0), 0);
            selectedPort = server.getAddress().getPort();
        }

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
        System.out.println(">>> Ayush NGO legacy backend is ONLINE!");
        System.out.println(">>> Local Web URL : http://localhost:" + selectedPort + "/index.html");
        System.out.println(">>> All Pages     : http://localhost:" + selectedPort + "/showcase.html");
        System.out.println(">>> Health Check  : http://localhost:" + selectedPort + "/api/health");
        System.out.println(">>> Active Port   : " + selectedPort);
        System.out.println(">>> Persistence   : Saved records written to " + DATA_DIR);
        System.out.println(">>> Press Ctrl + C to stop the server");
        System.out.println("===============================================================");
    }

    private static void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
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
                  "service": "Ayush NGO legacy backend",
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
                  "available": false,
                  "message": "Verified impact data is not available.",
                  "items": []
                }
                """;
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
            String json = "[]";
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
            String json = "[]";
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
            String json = "[]";
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
                  "message": "Your message has been received.",
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

            sendJsonResponse(exchange, 503,
                    "{\"success\":false,\"message\":\"Online donations are unavailable. No request was recorded.\"}");
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
            sendJsonResponse(exchange, 201, "{\"success\":true,\"message\":\"Your newsletter signup request has been recorded.\"}");
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
