package com.demoapplication.saas.ratelimit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Sliding-window rate limiter backed by Redis.
 *
 * Strategy: INCR + EXPIRE on a per-IP key.
 * Window: 60 seconds / 100 requests (configurable via constants below).
 *
 * The INCR/EXPIRE approach is an approximate sliding window that is
 * accurate enough for most rate-limiting use cases and requires only
 * two Redis commands per request.
 */
@Service
public class RateLimitService {

    /** Maximum number of requests allowed per window. */
    public static final int MAX_REQUESTS = 100;

    /** Window size in seconds. */
    public static final int WINDOW_SECONDS = 60;

    private final RedisTemplate<String, Object> redisTemplate;

    public RateLimitService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Checks whether the given client key (typically the remote IP) has exceeded
     * the rate limit.
     *
     * @param clientKey unique key per client (e.g. "rl:192.168.1.1")
     * @return {@code true} when the request is allowed; {@code false} when the limit is exceeded
     */
    public boolean isAllowed(String clientKey) {
        String redisKey = "rate_limit:" + clientKey;

        // Atomically increment the counter
        Long count = redisTemplate.opsForValue().increment(redisKey);

        if (count == null) {
            // Redis unavailable — fail open (allow the request) to avoid cascading failure
            return true;
        }

        if (count == 1) {
            // First request in this window — set the expiry
            redisTemplate.expire(redisKey, Duration.ofSeconds(WINDOW_SECONDS));
        }

        return count <= MAX_REQUESTS;
    }

    /**
     * Returns the TTL (in seconds) for the rate-limit key so callers can
     * populate the {@code Retry-After} response header.
     */
    public long getRetryAfterSeconds(String clientKey) {
        String redisKey = "rate_limit:" + clientKey;
        Long ttl = redisTemplate.getExpire(redisKey);
        return (ttl != null && ttl > 0) ? ttl : WINDOW_SECONDS;
    }
}
