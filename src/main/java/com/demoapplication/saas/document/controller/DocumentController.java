package com.demoapplication.saas.document.controller;

import com.demoapplication.saas.common.ApiResponse;
import com.demoapplication.saas.document.dto.DocumentResponse;
import com.demoapplication.saas.document.entity.Document;
import com.demoapplication.saas.document.entity.DocumentStatus;
import com.demoapplication.saas.document.service.DocumentService;
import com.demoapplication.saas.security.CustomUserPrincipal;
import com.demoapplication.saas.workflow.dto.WorkflowHistoryResponse;
import com.demoapplication.saas.workflow.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@Tag(name = "Documents", description = "Document management APIs")
public class DocumentController {

    private final DocumentService documentService;
    private final WorkflowService workflowService;

    public DocumentController(DocumentService documentService, WorkflowService workflowService) {
        this.documentService = documentService;
        this.workflowService = workflowService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document", description = "Upload a file and create a document record")
    public ApiResponse<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @AuthenticationPrincipal CustomUserPrincipal principal) throws IOException {
        
        DocumentResponse response = documentService.uploadDocument(file, title, principal.getId());
        return ApiResponse.success(response, "Document uploaded successfully");
    }

    @GetMapping
    @Operation(summary = "List all documents", description = "Get all documents for the current tenant")
    public ApiResponse<List<DocumentResponse>> listDocuments(
            @Parameter(description = "Filter by status")
            @RequestParam(required = false) DocumentStatus status) {
        
        List<DocumentResponse> documents;
        if (status != null) {
            documents = documentService.listDocumentsByStatus(status);
        } else {
            documents = documentService.listDocuments();
        }
        return ApiResponse.success(documents);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a document", description = "Get a document by ID with download URL")
    public ApiResponse<DocumentResponse> getDocument(
            @PathVariable UUID id) {
        
        DocumentResponse response = documentService.getDocument(id);
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Get download URL", description = "Get a presigned URL to download the document")
    public ApiResponse<Map<String, String>> getDownloadUrl(
            @PathVariable UUID id) {
        
        String downloadUrl = documentService.getDownloadUrl(id);
        return ApiResponse.success(Map.of("downloadUrl", downloadUrl));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a document", description = "Delete a document and its associated file")
    public ApiResponse<Void> deleteDocument(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        
        documentService.deleteDocument(id, principal.getId());
        return ApiResponse.success(null, "Document deleted successfully");
    }

    // ---------------------------------------------------------------
    // Phase 5 — Workflow endpoints
    // ---------------------------------------------------------------

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit a document for review",
               description = "Transition document from DRAFT to SUBMITTED. Allowed roles: EMPLOYEE, ADMIN.")
    public ApiResponse<DocumentResponse> submitDocument(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        Document document = workflowService.submitDocument(
                id, principal.getId(), principal.getRole(), principal.getTenantId());
        return ApiResponse.success(documentService.getDocument(document.getId()),
                "Document submitted for review");
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve a submitted document",
               description = "Transition document from SUBMITTED to APPROVED. Allowed roles: MANAGER, ADMIN.")
    public ApiResponse<DocumentResponse> approveDocument(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        Document document = workflowService.approveDocument(
                id, principal.getId(), principal.getRole(), principal.getTenantId());
        return ApiResponse.success(documentService.getDocument(document.getId()),
                "Document approved");
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject a submitted document",
               description = "Transition document from SUBMITTED to REJECTED. Allowed roles: MANAGER, ADMIN.")
    public ApiResponse<DocumentResponse> rejectDocument(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        Document document = workflowService.rejectDocument(
                id, principal.getId(), principal.getRole(), principal.getTenantId());
        return ApiResponse.success(documentService.getDocument(document.getId()),
                "Document rejected");
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get workflow history",
               description = "Returns the ordered audit trail of status transitions for a document.")
    public ApiResponse<List<WorkflowHistoryResponse>> getHistory(
            @PathVariable UUID id) {

        List<WorkflowHistoryResponse> history = workflowService.getHistory(id);
        return ApiResponse.success(history);
    }
}
