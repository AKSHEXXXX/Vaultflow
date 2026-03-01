package com.demoapplication.saas.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Phase 6 — Rate-limiting servlet filter.
 *
 * Placed early in the filter chain (order = 1) so it runs before Spring Security.
 * Returns HTTP 429 with a JSON body and a {@code Retry-After} header when the
 * per-IP sliding-window limit is exceeded.
 *
 * Only API paths ({@code /api/**}) are rate-limited; static/actuator paths pass through.
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);

    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;

    public RateLimitFilter(RateLimitService rateLimitService, ObjectMapper objectMapper) {
        this.rateLimitService = rateLimitService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // Only rate-limit API paths
        return !path.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String clientIp = resolveClientIp(request);

        if (rateLimitService.isAllowed(clientIp)) {
            filterChain.doFilter(request, response);
        } else {
            long retryAfter = rateLimitService.getRetryAfterSeconds(clientIp);
            logger.warn("Rate limit exceeded for IP: {} on path: {}", clientIp, request.getServletPath());

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(retryAfter));

            Map<String, Object> body = Map.of(
                    "status", 429,
                    "error", "Too Many Requests",
                    "message", "Rate limit exceeded. Maximum "
                            + RateLimitService.MAX_REQUESTS + " requests per "
                            + RateLimitService.WINDOW_SECONDS + " seconds.",
                    "retryAfterSeconds", retryAfter
            );
            objectMapper.writeValue(response.getWriter(), body);
        }
    }

    /**
     * Resolves the real client IP, respecting common reverse-proxy headers.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // X-Forwarded-For may contain a comma-separated list; first is the originating client
            return xff.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
