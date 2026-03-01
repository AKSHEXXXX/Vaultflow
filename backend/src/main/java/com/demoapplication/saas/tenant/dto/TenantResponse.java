package com.demoapplication.saas.tenant.dto;

import java.util.UUID;

public class TenantResponse {

    private UUID id;
    private String name;

    public TenantResponse() {}

    public TenantResponse(UUID id, String name) {
        this.id = id;
        this.name = name;
    }

    public UUID getId()   { return id; }
    public String getName() { return name; }
    public void setId(UUID id)         { this.id = id; }
    public void setName(String name)   { this.name = name; }
}
