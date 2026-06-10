package com.hireiq.controller;

import com.hireiq.dto.*;
import com.hireiq.service.CandidateProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "4. Candidate Profile", description = "Profile management and resume upload")
@SecurityRequirement(name = "Bearer Authentication")
public class CandidateProfileController {

    private final CandidateProfileService profileService;

    // ── 1. GET FULL PROFILE ─────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get my full profile", description = "CANDIDATE only. Returns the candidate's full profile with nested lists.")
    public ResponseEntity<ProfileDto.ProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.getMyProfile(userDetails.getUsername()));
    }

    // ── 2. CREATE or UPDATE BASIC INFO ──────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Update basic profile details", description = "CANDIDATE only. Updates basic profile fields (name, phone, notice period, preferences, etc.).")
    public ResponseEntity<ProfileDto.ProfileResponse> saveProfile(
            @RequestBody ProfileDto.ProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.saveProfile(request, userDetails.getUsername()));
    }

    // ── 3. PROFILE COMPLETION ───────────────────────────────────
    @GetMapping("/completion")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get profile completion info", description = "CANDIDATE only. Returns completion percentage and list of missing items.")
    public ResponseEntity<Map<String, Object>> getProfileCompletion(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.getProfileCompletion(userDetails.getUsername()));
    }

    // ── 4. RESUME UPLOAD ────────────────────────────────────────
    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Upload resume PDF", description = "CANDIDATE only. Upload resume PDF to parse and auto-fill details.")
    public ResponseEntity<?> uploadResume(
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            ProfileDto.ProfileResponse response = profileService.uploadResume(file, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload resume. Please try again."));
        }
    }

    // ── 5. WORK EXPERIENCE CRUD ─────────────────────────────────
    @GetMapping("/experience")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get my work experiences")
    public ResponseEntity<List<WorkExperienceDto.Response>> getExperiences(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.getExperiences(userDetails.getUsername()));
    }

    @PostMapping("/experience")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Add work experience")
    public ResponseEntity<WorkExperienceDto.Response> addExperience(
            @RequestBody WorkExperienceDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.addExperience(request, userDetails.getUsername()));
    }

    @PutMapping("/experience/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Update work experience")
    public ResponseEntity<WorkExperienceDto.Response> updateExperience(
            @PathVariable Long id,
            @RequestBody WorkExperienceDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.updateExperience(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/experience/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Delete work experience")
    public ResponseEntity<Map<String, String>> deleteExperience(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        profileService.deleteExperience(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Work experience deleted successfully"));
    }

    // ── 6. EDUCATION CRUD ───────────────────────────────────────
    @GetMapping("/education")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get my educational details")
    public ResponseEntity<List<EducationDto.Response>> getEducations(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.getEducations(userDetails.getUsername()));
    }

    @PostMapping("/education")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Add education detail")
    public ResponseEntity<EducationDto.Response> addEducation(
            @RequestBody EducationDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.addEducation(request, userDetails.getUsername()));
    }

    @PutMapping("/education/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Update education detail")
    public ResponseEntity<EducationDto.Response> updateEducation(
            @PathVariable Long id,
            @RequestBody EducationDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.updateEducation(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/education/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Delete education detail")
    public ResponseEntity<Map<String, String>> deleteEducation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        profileService.deleteEducation(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Education detail deleted successfully"));
    }

    // ── 7. CERTIFICATION CRUD ───────────────────────────────────
    @PostMapping("/certification")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Add certification")
    public ResponseEntity<CertificationDto.Response> addCertification(
            @RequestBody CertificationDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.addCertification(request, userDetails.getUsername()));
    }

    @PutMapping("/certification/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Update certification")
    public ResponseEntity<CertificationDto.Response> updateCertification(
            @PathVariable Long id,
            @RequestBody CertificationDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.updateCertification(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/certification/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Delete certification")
    public ResponseEntity<Map<String, String>> deleteCertification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        profileService.deleteCertification(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Certification deleted successfully"));
    }

    // ── 8. PROJECT CRUD ─────────────────────────────────────────
    @PostMapping("/project")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Add project")
    public ResponseEntity<ProjectDto.Response> addProject(
            @RequestBody ProjectDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.addProject(request, userDetails.getUsername()));
    }

    @PutMapping("/project/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Update project")
    public ResponseEntity<ProjectDto.Response> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.updateProject(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/project/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Delete project")
    public ResponseEntity<Map<String, String>> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        profileService.deleteProject(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
    }

    // ── 9. LANGUAGE CRUD ────────────────────────────────────────
    @PostMapping("/language")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Add language")
    public ResponseEntity<LanguageDto.Response> addLanguage(
            @RequestBody LanguageDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(profileService.addLanguage(request, userDetails.getUsername()));
    }

    @DeleteMapping("/language/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Delete language")
    public ResponseEntity<Map<String, String>> deleteLanguage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        profileService.deleteLanguage(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Language deleted successfully"));
    }
}