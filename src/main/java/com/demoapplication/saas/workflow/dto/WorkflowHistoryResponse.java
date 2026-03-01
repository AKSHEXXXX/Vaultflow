package com.demoapplication.saas.workflow.dto;

import com.demoapplication.saas.workflow.entity.WorkflowAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for a single workflow history entry.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowHistoryResponse {

    private UUID id;
    private WorkflowAction action;
    private UUID performedById;
    private String performedByEmail;
    private LocalDateTime timestamp;
}
