package com.demoapplication.saas.document.dto;

import com.demoapplication.saas.document.entity.DocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    
    private UUID id;
    private String title;
    private DocumentStatus status;
    private String uploadedByEmail;
    private UUID uploadedById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String downloadUrl;
}
