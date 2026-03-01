package com.demoapplication.saas.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateTenantRequest {

    @NotBlank(message = "Tenant name must not be blank")
    @Size(min = 2, max = 100, message = "Tenant name must be between 2 and 100 characters")
    private String name;

    public UpdateTenantRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
