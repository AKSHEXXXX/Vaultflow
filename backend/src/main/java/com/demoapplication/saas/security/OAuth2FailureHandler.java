package com.demoapplication.saas.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2FailureHandler implements AuthenticationFailureHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2FailureHandler.class);

    @Value("${app.oauth2.redirect-uri:http://localhost:3000/oauth/callback}")
    private String frontendRedirectUri;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {
        logger.error("OAuth2 authentication failed: {}", exception.getMessage());
        
        String errorMessage = exception.getMessage() != null ? exception.getMessage() : "Authentication failed";
        String redirectUrl = frontendRedirectUri + "?error=" + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        
        response.sendRedirect(redirectUrl);
    }
}
