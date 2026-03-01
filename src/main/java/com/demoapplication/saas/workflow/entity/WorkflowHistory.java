package com.demoapplication.saas.workflow.entity;

import com.demoapplication.saas.document.entity.Document;
import com.demoapplication.saas.tenant.entity.Tenant;
import com.demoapplication.saas.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Records every workflow state transition for a document.
 * Maps to the workflow_history table which has its own id and timestamp
 * (does NOT extend BaseEntity — no created_at/updated_at columns).
 */
@Entity
@Table(name = "workflow_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 50)
    private WorkflowAction action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
}
