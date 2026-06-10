package com.hireiq.controller;

import com.hireiq.dto.ApplicationDto;
import com.hireiq.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "5. Applications", description = "Apply for jobs and view application status")
@SecurityRequirement(name = "Bearer Authentication")
public class ApplicationController {

    private final ApplicationService applicationService;

    // ── APPLY for a job (candidate only) ──────────────────────
    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(
            summary = "Apply for a job",
            description = """
            CANDIDATE only. Applies for the given job.
            Requirements before applying:
            1. You must have uploaded your resume
            2. The job must be ACTIVE
            3. You cannot apply to the same job twice
            In Module 3, AI match scoring will run automatically after applying.
            """
    )
    public ResponseEntity<?> apply(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            ApplicationDto.ApplicationResponse response =
                    applicationService.apply(jobId, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET my applications (candidate view) ──────────────────
    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(
            summary = "My applications",
            description = "CANDIDATE only. Returns all jobs this candidate has applied to, with status and match score."
    )
    public ResponseEntity<List<ApplicationDto.ApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                applicationService.getMyApplications(userDetails.getUsername()));
    }

    // ── GET applications for a job (recruiter view) ────────────
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(
            summary = "Applications for a job",
            description = "RECRUITER only. Returns all candidates who applied, sorted by AI match score (highest first)."
    )
    public ResponseEntity<?> getApplicationsForJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ApplicationDto.ApplicationResponse> response =
                    applicationService.getApplicationsForJob(jobId, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET applications for a job semantically (recruiter view) ──
    @GetMapping("/job/{jobId}/search")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(
            summary = "Semantic search candidates for a job",
            description = "RECRUITER only. Uses Spring AI vector embeddings to rank candidates semantically by a natural language query."
    )
    public ResponseEntity<?> searchCandidates(
            @PathVariable Long jobId,
            @RequestParam String query,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ApplicationDto.ApplicationResponse> response =
                    applicationService.searchCandidatesSemantically(jobId, query, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}