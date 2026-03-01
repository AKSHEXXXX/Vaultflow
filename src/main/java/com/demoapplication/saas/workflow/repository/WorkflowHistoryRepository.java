package com.demoapplication.saas.workflow.repository;

import com.demoapplication.saas.workflow.entity.WorkflowHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowHistoryRepository extends JpaRepository<WorkflowHistory, UUID> {

    /**
     * Returns the full audit trail for a document, ordered oldest-first.
     */
    List<WorkflowHistory> findByDocumentIdOrderByTimestampAsc(UUID documentId);

    /**
     * Returns all workflow events in a tenant, newest-first.
     */
    List<WorkflowHistory> findByTenantIdOrderByTimestampDesc(UUID tenantId);
}
