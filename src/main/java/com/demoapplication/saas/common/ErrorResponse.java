package com.demoapplication.saas.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private final boolean success;
    private final String error;
    private final String message;
    private final Integer retryAfterSeconds;
    private final LocalDateTime timestamp;

    public static ErrorResponse of(String error, String message) {
        return ErrorResponse.builder()
                .success(false)
                .error(error)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse rateLimited(int retryAfterSeconds) {
        return ErrorResponse.builder()
                .success(false)
                .error("RATE_LIMIT_EXCEEDED")
                .message("Too many requests")
                .retryAfterSeconds(retryAfterSeconds)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
