package com.demoapplication.saas.tenant.controller;

import com.demoapplication.saas.common.ApiResponse;
import com.demoapplication.saas.security.CustomUserPrincipal;
import com.demoapplication.saas.tenant.dto.TenantResponse;
import com.demoapplication.saas.tenant.dto.UpdateTenantRequest;
import com.demoapplication.saas.tenant.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tenants")
@Tag(name = "Tenant Management", description = "View and update your workspace settings")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    // GET /api/v1/tenants/me
    @GetMapping("/me")
    @Operation(summary = "Get current tenant info")
    public ResponseEntity<ApiResponse<TenantResponse>> getCurrentTenant() {
        TenantResponse response = tenantService.getCurrentTenant();
        return ResponseEntity.ok(ApiResponse.success(response, "Tenant retrieved"));
    }

    // PUT /api/v1/tenants/me — ADMIN only
    @PutMapping("/me")
    @Operation(summary = "Update current tenant name (ADMIN only)")
    public ResponseEntity<ApiResponse<TenantResponse>> updateTenant(
            @Valid @RequestBody UpdateTenantRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        TenantResponse response = tenantService.updateTenant(request, principal.getRole());
        return ResponseEntity.ok(ApiResponse.success(response, "Tenant updated"));
    }
}
