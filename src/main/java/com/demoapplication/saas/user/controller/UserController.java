package com.demoapplication.saas.user.controller;

import com.demoapplication.saas.common.ApiResponse;
import com.demoapplication.saas.security.CustomUserPrincipal;
import com.demoapplication.saas.user.dto.InviteUserRequest;
import com.demoapplication.saas.user.dto.UpdateRoleRequest;
import com.demoapplication.saas.user.dto.UserResponse;
import com.demoapplication.saas.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "Manage tenant users and roles")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ---------------------------------------------------------------
    // GET /api/v1/users/me
    // ---------------------------------------------------------------
    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        UserResponse response = userService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "User retrieved"));
    }

    // ---------------------------------------------------------------
    // GET /api/v1/users
    // ---------------------------------------------------------------
    @GetMapping
    @Operation(summary = "List all users in the same tenant")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers() {

        List<UserResponse> users = userService.listUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved"));
    }

    // ---------------------------------------------------------------
    // POST /api/v1/users/invite — ADMIN only
    // ---------------------------------------------------------------
    @PostMapping("/invite")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Invite a new user with an explicit role (ADMIN only)")
    public ResponseEntity<ApiResponse<UserResponse>> inviteUser(
            @Valid @RequestBody InviteUserRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        UserResponse response = userService.inviteUser(
                request, principal.getId(), principal.getRole());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User invited successfully"));
    }

    // ---------------------------------------------------------------
    // PUT /api/v1/users/{id}/role — ADMIN only
    // ---------------------------------------------------------------
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a user's role (ADMIN only)")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoleRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        UserResponse response = userService.updateUserRole(
                id, request, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.success(response, "Role updated"));
    }

    // ---------------------------------------------------------------
    // DELETE /api/v1/users/{id} — ADMIN only
    // ---------------------------------------------------------------
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a user from the tenant (ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        userService.deleteUser(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "User deleted"));
    }
}
