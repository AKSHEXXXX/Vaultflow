package com.demoapplication.saas.config;

import com.demoapplication.saas.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ApiResponse<Map<String, Object>> root() {
        return ApiResponse.success(Map.of(
            "name", "SaaS Platform API",
            "version", "1.0.0",
            "status", "running",
            "endpoints", Map.of(
                "health", "/api/health",
                "docs", "/swagger-ui.html",
                "auth", "/api/v1/auth",
                "oauth", "/oauth2/authorization/google"
            )
        ));
    }

    @GetMapping("/api/health")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.success(Map.of("status", "UP"));
    }
}
