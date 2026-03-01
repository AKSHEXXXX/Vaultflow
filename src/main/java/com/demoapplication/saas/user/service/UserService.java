package com.demoapplication.saas.user.service;

import com.demoapplication.saas.common.TenantContextHolder;
import com.demoapplication.saas.tenant.entity.Tenant;
import com.demoapplication.saas.tenant.repository.TenantRepository;
import com.demoapplication.saas.user.dto.InviteUserRequest;
import com.demoapplication.saas.user.dto.UpdateRoleRequest;
import com.demoapplication.saas.user.dto.UserResponse;
import com.demoapplication.saas.user.entity.Role;
import com.demoapplication.saas.user.entity.User;
import com.demoapplication.saas.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       TenantRepository tenantRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ---------------------------------------------------------------
    // GET /me — return the current authenticated user
    // ---------------------------------------------------------------
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toResponse(user);
    }

    // ---------------------------------------------------------------
    // GET / — list all users in the same tenant
    // ---------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        UUID tenantId = TenantContextHolder.getTenantId();
        return userRepository.findByTenantId(tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // PUT /{id}/role — ADMIN only: change a user's role
    // ---------------------------------------------------------------
    @Transactional
    public UserResponse updateUserRole(UUID targetUserId, UpdateRoleRequest request,
                                       UUID callerId, Role callerRole) {
        assertAdmin(callerRole, "update roles");
        UUID tenantId = TenantContextHolder.getTenantId();

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Ensure the target user belongs to the same tenant
        if (!targetUser.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("User not found");
        }

        // Prevent admin from demoting themselves (last admin check)
        if (targetUserId.equals(callerId) && request.getRole() != Role.ADMIN) {
            long adminCount = userRepository.findByTenantId(tenantId)
                    .stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot change your own role — you are the only admin in this tenant.");
            }
        }

        Role oldRole = targetUser.getRole();
        targetUser.setRole(request.getRole());
        User saved = userRepository.save(targetUser);

        logger.info("User {} role changed from {} to {} by admin {} in tenant {}",
                targetUserId, oldRole, request.getRole(), callerId, tenantId);

        return toResponse(saved);
    }

    // ---------------------------------------------------------------
    // POST /invite — ADMIN only: add a user with an explicit role
    // ---------------------------------------------------------------
    @Transactional
    public UserResponse inviteUser(InviteUserRequest request, UUID callerId, Role callerRole) {
        assertAdmin(callerRole, "invite users");
        UUID tenantId = TenantContextHolder.getTenantId();

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        User user = new User();
        user.setTenant(tenant);
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        User saved = userRepository.save(user);

        logger.info("User {} invited as {} by admin {} in tenant {}",
                saved.getEmail(), saved.getRole(), callerId, tenantId);

        return toResponse(saved);
    }

    // ---------------------------------------------------------------
    // DELETE /{id} — ADMIN only: remove a user from the tenant
    // ---------------------------------------------------------------
    @Transactional
    public void deleteUser(UUID targetUserId, UUID callerId, Role callerRole) {
        assertAdmin(callerRole, "delete users");
        UUID tenantId = TenantContextHolder.getTenantId();

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!targetUser.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("User not found");
        }

        if (targetUserId.equals(callerId)) {
            throw new IllegalStateException("You cannot delete yourself.");
        }

        userRepository.delete(targetUser);
        logger.info("User {} deleted by admin {} in tenant {}", targetUserId, callerId, tenantId);
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------
    private void assertAdmin(Role callerRole, String operation) {
        if (callerRole != Role.ADMIN) {
            throw new AccessDeniedException(
                    "Role " + callerRole + " is not permitted to " + operation + ". ADMIN role required.");
        }
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .tenantId(user.getTenant().getId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
