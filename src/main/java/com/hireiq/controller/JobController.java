package com.hireiq.controller;

import com.hireiq.dto.JobDto;
import com.hireiq.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "3. Jobs", description = "Job posting management")
@SecurityRequirement(name = "Bearer Authentication")
public class JobController {

    private final JobService jobService;

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Create a job posting",
            description = "RECRUITER only. Creates a new active job posting.")
    public ResponseEntity<JobDto.JobResponse> createJob(
            @Valid @RequestBody JobDto.JobRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobService.createJob(request, userDetails.getUsername()));
    }

    @GetMapping
    @Operation(summary = "Browse all active jobs",
            description = "Any logged-in user. Returns all ACTIVE job postings.")
    public ResponseEntity<List<JobDto.JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllActiveJobs());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job details by ID")
    public ResponseEntity<JobDto.JobResponse> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Get my job postings",
            description = "RECRUITER only. Returns all jobs posted by the logged-in recruiter.")
    public ResponseEntity<List<JobDto.JobResponse>> getMyJobs(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.getMyJobs(userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Update a job posting",
            description = "RECRUITER only. Must be the owner of the job.")
    public ResponseEntity<JobDto.JobResponse> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobDto.JobRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.updateJob(id, request, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Close a job posting",
            description = "RECRUITER only. Closes the job so no more applications are accepted.")
    public ResponseEntity<JobDto.JobResponse> closeJob(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.closeJob(id, userDetails.getUsername()));
    }

    @GetMapping("/search")
    @Operation(summary = "Search active jobs by title keyword",
            description = "e.g. /api/jobs/search?keyword=Java")
    public ResponseEntity<List<JobDto.JobResponse>> searchJobs(
            @RequestParam String keyword) {
        return ResponseEntity.ok(jobService.searchJobs(keyword));
    }
}