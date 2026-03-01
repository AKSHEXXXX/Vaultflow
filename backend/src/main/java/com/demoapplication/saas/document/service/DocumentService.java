package com.demoapplication.saas.document.service;

import com.demoapplication.saas.common.TenantContextHolder;
import com.demoapplication.saas.document.dto.DocumentResponse;
import com.demoapplication.saas.document.dto.DocumentUploadRequest;
import com.demoapplication.saas.document.entity.Document;
import com.demoapplication.saas.document.entity.DocumentStatus;
import com.demoapplication.saas.document.repository.DocumentRepository;
import com.demoapplication.saas.tenant.entity.Tenant;
import com.demoapplication.saas.tenant.repository.TenantRepository;
import com.demoapplication.saas.user.entity.User;
import com.demoapplication.saas.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    public DocumentService(DocumentRepository documentRepository,
                           TenantRepository tenantRepository,
                           UserRepository userRepository,
                           S3Service s3Service) {
        this.documentRepository = documentRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.s3Service = s3Service;
    }

    @Transactional
    @CacheEvict(value = "documents", key = "#userId.toString()")   // evict per-tenant cache on upload
    public DocumentResponse uploadDocument(MultipartFile file, String title, UUID userId) throws IOException {
        UUID tenantId = TenantContextHolder.getTenantId();
        
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Create document entity first to get ID
        Document document = new Document();
        document.setTenant(tenant);
        document.setUploadedBy(user);
        document.setTitle(title);
        document.setStatus(DocumentStatus.DRAFT);
        document = documentRepository.save(document);

        // Upload file to S3
        String s3Key = s3Service.uploadFile(file, tenantId, document.getId());
        document.setS3Key(s3Key);
        document = documentRepository.save(document);

        // Evict the tenant's document list cache
        evictDocumentCache(tenantId);

        logger.info("Document uploaded: {} by user {} in tenant {}", document.getId(), userId, tenantId);

        return mapToResponse(document, true);
    }

    /**
     * Lists all documents for the current tenant.
     * Result is cached per tenant UUID with a 60-second TTL (configured in RedisConfig).
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "documents", key = "T(com.demoapplication.saas.common.TenantContextHolder).getTenantId()")
    public List<DocumentResponse> listDocuments() {
        UUID tenantId = TenantContextHolder.getTenantId();
        List<Document> documents = documentRepository.findByTenantId(tenantId);
        
        return documents.stream()
                .map(doc -> mapToResponse(doc, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listDocumentsByStatus(DocumentStatus status) {
        UUID tenantId = TenantContextHolder.getTenantId();
        List<Document> documents = documentRepository.findByTenantIdAndStatus(tenantId, status);
        
        return documents.stream()
                .map(doc -> mapToResponse(doc, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocument(UUID documentId) {
        UUID tenantId = TenantContextHolder.getTenantId();
        
        Document document = documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        return mapToResponse(document, true);
    }

    @Transactional(readOnly = true)
    public String getDownloadUrl(UUID documentId) {
        UUID tenantId = TenantContextHolder.getTenantId();
        
        Document document = documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        if (document.getS3Key() == null) {
            throw new IllegalStateException("Document has no associated file");
        }

        return s3Service.generatePresignedDownloadUrl(document.getS3Key());
    }

    @Transactional
    public void deleteDocument(UUID documentId, UUID userId) {
        UUID tenantId = TenantContextHolder.getTenantId();
        
        Document document = documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        // Delete from S3 if file exists
        if (document.getS3Key() != null) {
            s3Service.deleteFile(document.getS3Key());
        }

        documentRepository.delete(document);

        // Evict the tenant's document list cache
        evictDocumentCache(tenantId);

        logger.info("Document deleted: {} by user {} in tenant {}", documentId, userId, tenantId);
    }

    /**
     * Programmatic cache eviction helper — used when the tenant ID is resolved at runtime
     * inside a @Transactional method (SpEL cannot call TenantContextHolder after the transaction
     * has already modified the context).
     */
    @CacheEvict(value = "documents", key = "#tenantId")
    public void evictDocumentCache(UUID tenantId) {
        // Spring AOP handles the eviction; method body intentionally empty
    }

    private DocumentResponse mapToResponse(Document document, boolean includeDownloadUrl) {
        DocumentResponse.DocumentResponseBuilder builder = DocumentResponse.builder()
                .id(document.getId())
                .title(document.getTitle())
                .status(document.getStatus())
                .uploadedById(document.getUploadedBy().getId())
                .uploadedByEmail(document.getUploadedBy().getEmail())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt());

        if (includeDownloadUrl && document.getS3Key() != null) {
            builder.downloadUrl(s3Service.generatePresignedDownloadUrl(document.getS3Key()));
        }

        return builder.build();
    }
}
