package com.demoapplication.saas.security;

import com.demoapplication.saas.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.context.annotation.Lazy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    private final AuthService authService;

    @Value("${app.oauth2.redirect-uri:http://localhost:3000/oauth/callback}")
    private String frontendRedirectUri;

    public OAuth2SuccessHandler(@Lazy AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        logger.info("OAuth2 login successful for email: {}", email);
        
        try {
            // Map user to tenant and role, create if not exists
            // Generate internal JWT
            String jwt = authService.handleOAuth2Login(email, name);
            
            // Redirect to frontend with the token
            String redirectUrl = frontendRedirectUri + "?token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8);
            logger.debug("Redirecting OAuth2 user to: {}", frontendRedirectUri);
            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            logger.error("Error handling OAuth2 login for email: {}", email, e);
            String errorRedirectUrl = frontendRedirectUri + "?error=" + URLEncoder.encode("Authentication failed", StandardCharsets.UTF_8);
            response.sendRedirect(errorRedirectUrl);
        }
    }
}
