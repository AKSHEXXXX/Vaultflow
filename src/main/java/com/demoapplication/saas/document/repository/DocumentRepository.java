package com.demoapplication.saas.document.repository;

import com.demoapplication.saas.document.entity.Document;
import com.demoapplication.saas.document.entity.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    
    List<Document> findByTenantId(UUID tenantId);
    
    List<Document> findByTenantIdAndStatus(UUID tenantId, DocumentStatus status);
    
    List<Document> findByUploadedById(UUID userId);
    
    Optional<Document> findByIdAndTenantId(UUID id, UUID tenantId);
    
    boolean existsByIdAndTenantId(UUID id, UUID tenantId);
}
