package com.demoapplication.saas.auth.service;

import com.demoapplication.saas.auth.dto.AuthResponse;
import com.demoapplication.saas.auth.dto.LoginRequest;
import com.demoapplication.saas.auth.dto.RefreshTokenRequest;
import com.demoapplication.saas.auth.dto.RegisterRequest;
import com.demoapplication.saas.auth.entity.RefreshToken;
import com.demoapplication.saas.auth.repository.RefreshTokenRepository;
import com.demoapplication.saas.security.JwtTokenProvider;
import com.demoapplication.saas.tenant.entity.Tenant;
import com.demoapplication.saas.tenant.repository.TenantRepository;
import com.demoapplication.saas.user.entity.Role;
import com.demoapplication.saas.user.entity.User;
import com.demoapplication.saas.user.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
            TenantRepository tenantRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Create tenant
        Tenant tenant = new Tenant();
        tenant.setName(request.getCompanyName());
        tenant = tenantRepository.save(tenant);

        // Create admin user for the tenant
        User user = new User();
        user.setTenant(tenant);
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ADMIN);
        user = userRepository.save(user);

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), tenant.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .tenantId(tenant.getId().toString())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getTenant().getId(), user.getEmail(), user.getRole().name());
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .tenantId(user.getTenant().getId().toString())
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new IllegalArgumentException("Refresh token has expired. Please login again.");
        }

        User user = refreshToken.getUser();
        String newAccessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getTenant().getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken()) // reuse existing refresh token
                .role(user.getRole().name())
                .tenantId(user.getTenant().getId().toString())
                .build();
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenRepository.deleteByToken(request.getRefreshToken());
    }

    // Google OAuth2 handler
    @Transactional
    public String handleOAuth2Login(String email, String name) {
        User user = userRepository.findByEmail(email).orElse(null);
        Tenant tenant;
        if (user == null) {
            // Create new tenant and user
            tenant = new Tenant();
            tenant.setName(name);
            tenant = tenantRepository.save(tenant);
            user = new User();
            user.setTenant(tenant);
            user.setEmail(email);
            user.setPasswordHash(""); // No password for OAuth2
            user.setRole(Role.ADMIN);
            user = userRepository.save(user);
        } else {
            tenant = user.getTenant();
        }
        return jwtTokenProvider.generateAccessToken(
                user.getId(), tenant.getId(), user.getEmail(), user.getRole().name());
    }

    private String createRefreshToken(User user) {
        // Delete any existing refresh tokens for this user
        refreshTokenRepository.deleteByUserId(user.getId());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiration()));

        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }
}
