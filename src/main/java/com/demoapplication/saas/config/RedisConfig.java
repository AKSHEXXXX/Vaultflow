package com.demoapplication.saas.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Phase 6 — Redis configuration:
 *  - RedisCacheManager with JSON serialization and per-cache TTLs
 *  - Generic RedisTemplate<String, Object> for use by RateLimitService
 *
 * IMPORTANT: The ObjectMapper used for Redis serialization is NOT exposed as a
 * Spring @Bean to avoid it replacing the default Spring MVC ObjectMapper.
 * It is created as a private factory method instead.
 */
@Configuration
@EnableCaching
public class RedisConfig {

    /**
     * Creates a private ObjectMapper for Redis serialization only.
     * NOT a Spring bean — never injected into Spring MVC.
     */
    private ObjectMapper buildRedisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // Embed type information so deserialisation works for List<DocumentResponse> etc.
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }

    /**
     * Default cache configuration: JSON values, 60-second TTL, no caching of null values.
     */
    @Bean
    public RedisCacheConfiguration defaultCacheConfig() {
        GenericJackson2JsonRedisSerializer serializer =
                new GenericJackson2JsonRedisSerializer(buildRedisObjectMapper());

        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(60))
                .disableCachingNullValues()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(serializer));
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory,
                                          RedisCacheConfiguration defaultCacheConfig) {
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultCacheConfig)
                // Specific TTLs per cache name
                .withCacheConfiguration("documents",
                        defaultCacheConfig.entryTtl(Duration.ofSeconds(60)))
                .build();
    }

    /**
     * General-purpose RedisTemplate for manual Redis operations (e.g., rate limiting counters).
     * Uses String key + Long value serialization — no type embedding needed for counters.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new StringRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }
}
