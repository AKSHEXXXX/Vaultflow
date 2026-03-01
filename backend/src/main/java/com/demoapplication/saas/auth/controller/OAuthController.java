package com.demoapplication.saas.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth/oauth")
@Tag(name = "OAuth2", description = "OAuth2 authentication endpoints")
public class OAuthController {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    /**
     * Returns OAuth2 login URLs for available providers.
     * Frontend can use these URLs to initiate OAuth2 login flow.
     */
    @GetMapping("/providers")
    @Operation(summary = "Get OAuth2 providers", description = "Returns available OAuth2 provider login URLs")
    public ResponseEntity<Map<String, Object>> getOAuthProviders() {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> providers = new HashMap<>();
        
        // Google OAuth2 login URL (Spring Security standard endpoint)
        if (googleClientId != null && !googleClientId.isEmpty()) {
            providers.put("google", "/oauth2/authorization/google");
        }
        
        response.put("providers", providers);
        response.put("message", "Redirect user to the provider URL to initiate OAuth2 login");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Health check for OAuth2 configuration
     */
    @GetMapping("/status")
    @Operation(summary = "OAuth2 status", description = "Check if OAuth2 is properly configured")
    public ResponseEntity<Map<String, Object>> getOAuthStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("googleConfigured", googleClientId != null && !googleClientId.isEmpty());
        status.put("loginUrl", "/oauth2/authorization/google");
        status.put("callbackUrl", "/login/oauth2/code/google");
        return ResponseEntity.ok(status);
    }
}
