package com.demoapplication.saas.tenant.service;

import com.demoapplication.saas.common.TenantContextHolder;
import com.demoapplication.saas.tenant.dto.TenantResponse;
import com.demoapplication.saas.tenant.dto.UpdateTenantRequest;
import com.demoapplication.saas.tenant.entity.Tenant;
import com.demoapplication.saas.tenant.repository.TenantRepository;
import com.demoapplication.saas.user.entity.Role;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;

    public TenantService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public TenantResponse getCurrentTenant() {
        UUID tenantId = TenantContextHolder.getTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));
        return toResponse(tenant);
    }

    @Transactional
    public TenantResponse updateTenant(UpdateTenantRequest request, Role callerRole) {
        if (callerRole != Role.ADMIN) {
            throw new AccessDeniedException("Only ADMINs can update tenant settings");
        }
        UUID tenantId = TenantContextHolder.getTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));
        tenant.setName(request.getName());
        tenantRepository.save(tenant);
        return toResponse(tenant);
    }

    private TenantResponse toResponse(Tenant t) {
        return new TenantResponse(t.getId(), t.getName());
    }
}
