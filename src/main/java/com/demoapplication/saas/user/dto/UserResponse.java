package com.demoapplication.saas.user.dto;

import com.demoapplication.saas.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private UUID id;
    private String email;
    private Role role;
    private UUID tenantId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
