package com.hireiq.controller;

import com.hireiq.dto.TestDto;
import com.hireiq.service.TestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Tag(name = "6. AI Test Engine", description = "AI-generated tests with auto-grading and cooldown logic")
@SecurityRequirement(name = "Bearer Authentication")
public class TestController {

    private final TestService testService;

    @GetMapping("/status/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Check test eligibility",
            description = "Returns whether you can attempt, your last score, and next allowed date.")
    public ResponseEntity<?> getTestStatus(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            return ResponseEntity.ok(testService.getTestStatus(jobId, userDetails.getUsername()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/start/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Start the AI test",
            description = "Generates 20 unique AI questions based on the job role. Must be SHORTLISTED first. Save the attemptId to submit answers.")
    public ResponseEntity<?> startTest(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            return ResponseEntity.ok(testService.startTest(jobId, userDetails.getUsername()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/submit/{attemptId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Submit test answers",
            description = "Submit answers as { \"answers\": { \"1\": \"A\", \"2\": \"C\" } }. Score >= 75% = PASSED. Cooldown applied for lower scores.")
    public ResponseEntity<?> submitTest(
            @PathVariable Long attemptId,
            @RequestBody TestDto.SubmitTestRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            return ResponseEntity.ok(testService.submitTest(attemptId, request, userDetails.getUsername()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}