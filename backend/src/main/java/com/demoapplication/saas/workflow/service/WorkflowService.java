package com.demoapplication.saas.workflow.service;

import com.demoapplication.saas.common.TenantContextHolder;
import com.demoapplication.saas.document.entity.Document;
import com.demoapplication.saas.document.entity.DocumentStatus;
import com.demoapplication.saas.document.repository.DocumentRepository;
import com.demoapplication.saas.tenant.entity.Tenant;
import com.demoapplication.saas.tenant.repository.TenantRepository;
import com.demoapplication.saas.user.entity.Role;
import com.demoapplication.saas.user.entity.User;
import com.demoapplication.saas.user.repository.UserRepository;
import com.demoapplication.saas.workflow.dto.WorkflowHistoryResponse;
import com.demoapplication.saas.workflow.entity.WorkflowAction;
import com.demoapplication.saas.workflow.entity.WorkflowHistory;
import com.demoapplication.saas.workflow.repository.WorkflowHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkflowService {

    private static final Logger logger = LoggerFactory.getLogger(WorkflowService.class);

    private final DocumentRepository documentRepository;
    private final WorkflowHistoryRepository workflowHistoryRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    public WorkflowService(DocumentRepository documentRepository,
                           WorkflowHistoryRepository workflowHistoryRepository,
                           UserRepository userRepository,
                           TenantRepository tenantRepository) {
        this.documentRepository = documentRepository;
        this.workflowHistoryRepository = workflowHistoryRepository;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
    }

    // ---------------------------------------------------------------
    // SUBMIT  (DRAFT → SUBMITTED)  —  EMPLOYEE or ADMIN
    // ---------------------------------------------------------------
    @Transactional
    @CacheEvict(value = "documents", key = "#tenantId")
    public Document submitDocument(UUID documentId, UUID userId, Role callerRole, UUID tenantId) {
        assertRole(callerRole, "submit", Role.EMPLOYEE, Role.ADMIN);

        Document document = loadDocumentInTenant(documentId, tenantId);

        if (document.getStatus() != DocumentStatus.DRAFT) {
            throw new IllegalStateException(
                    "Cannot submit a document in status: " + document.getStatus()
                            + ". Document must be in DRAFT status.");
        }

        document.setStatus(DocumentStatus.PENDING);
        Document saved = documentRepository.save(document);

        recordHistory(saved, WorkflowAction.SUBMITTED, userId, tenantId);
        logger.info("Document {} submitted by user {} in tenant {}", documentId, userId, tenantId);
        return saved;
    }

    // ---------------------------------------------------------------
    // APPROVE  (SUBMITTED → APPROVED)  —  MANAGER or ADMIN
    // ---------------------------------------------------------------
    @Transactional
    @CacheEvict(value = "documents", key = "#tenantId")
    public Document approveDocument(UUID documentId, UUID userId, Role callerRole, UUID tenantId) {
        assertRole(callerRole, "approve", Role.MANAGER, Role.ADMIN);

        Document document = loadDocumentInTenant(documentId, tenantId);

        if (document.getStatus() != DocumentStatus.PENDING) {
            throw new IllegalStateException(
                    "Cannot approve a document in status: " + document.getStatus()
                            + ". Document must be in PENDING status.");
        }

        document.setStatus(DocumentStatus.APPROVED);
        Document saved = documentRepository.save(document);

        recordHistory(saved, WorkflowAction.APPROVED, userId, tenantId);
        logger.info("Document {} approved by user {} in tenant {}", documentId, userId, tenantId);
        return saved;
    }

    // ---------------------------------------------------------------
    // REJECT  (SUBMITTED → REJECTED)  —  MANAGER or ADMIN
    // ---------------------------------------------------------------
    @Transactional
    @CacheEvict(value = "documents", key = "#tenantId")
    public Document rejectDocument(UUID documentId, UUID userId, Role callerRole, UUID tenantId) {
        assertRole(callerRole, "reject", Role.MANAGER, Role.ADMIN);

        Document document = loadDocumentInTenant(documentId, tenantId);

        if (document.getStatus() != DocumentStatus.PENDING) {
            throw new IllegalStateException(
                    "Cannot reject a document in status: " + document.getStatus()
                            + ". Document must be in PENDING status.");
        }

        document.setStatus(DocumentStatus.REJECTED);
        Document saved = documentRepository.save(document);

        recordHistory(saved, WorkflowAction.REJECTED, userId, tenantId);
        logger.info("Document {} rejected by user {} in tenant {}", documentId, userId, tenantId);
        return saved;
    }

    // ---------------------------------------------------------------
    // HISTORY  —  any authenticated user in the tenant
    // ---------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<WorkflowHistoryResponse> getHistory(UUID documentId) {
        UUID tenantId = TenantContextHolder.getTenantId();

        // Verify document belongs to caller's tenant
        documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        return workflowHistoryRepository
                .findByDocumentIdOrderByTimestampAsc(documentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------

    private Document loadDocumentInTenant(UUID documentId, UUID tenantId) {
        return documentRepository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
    }

    private void recordHistory(Document document, WorkflowAction action, UUID userId, UUID tenantId) {
        User performer = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        WorkflowHistory history = new WorkflowHistory();
        history.setDocument(document);
        history.setTenant(tenant);
        history.setAction(action);
        history.setPerformedBy(performer);
        history.setTimestamp(LocalDateTime.now());

        workflowHistoryRepository.save(history);
    }

    /**
     * Throws AccessDeniedException if the caller's role is not one of the allowed roles.
     */
    private void assertRole(Role callerRole, String operation, Role... allowed) {
        for (Role r : allowed) {
            if (callerRole == r) return;
        }
        throw new org.springframework.security.access.AccessDeniedException(
                "Role " + callerRole + " is not permitted to " + operation + " documents.");
    }

    private WorkflowHistoryResponse toResponse(WorkflowHistory wh) {
        return WorkflowHistoryResponse.builder()
                .id(wh.getId())
                .action(wh.getAction())
                .performedById(wh.getPerformedBy().getId())
                .performedByEmail(wh.getPerformedBy().getEmail())
                .timestamp(wh.getTimestamp())
                .build();
    }
}
