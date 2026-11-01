package org.ayushngo.api.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.security.MessageDigest;

@Configuration
public class CsrfConfiguration implements WebMvcConfigurer {
    public static final String SESSION_ATTRIBUTE = "AYUSH_CSRF_TOKEN";

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new CsrfInterceptor()).addPathPatterns("/api/**");
    }

    private static final class CsrfInterceptor implements HandlerInterceptor {
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
                throws Exception {
            String method = request.getMethod();
            if (!("POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method) || "DELETE".equals(method))) {
                return true;
            }

            HttpSession session = request.getSession(false);
            Object expected = session == null ? null : session.getAttribute(SESSION_ATTRIBUTE);
            String actual = request.getHeader("X-XSRF-TOKEN");
            if (expected instanceof String token && actual != null
                    && MessageDigest.isEqual(token.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    actual.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
                return true;
            }

            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"Session expired. Refresh and try again.\"}");
            return false;
        }
    }
}
