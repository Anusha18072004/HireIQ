package com.hireiq.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

public class ProfileDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProfileRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private LocalDate dateOfBirth;
        private String gender;
        private String city;
        private String state;
        private String pincode;
        
        // Career preferences
        private String noticePeriod;
        private String currentSalary;
        private String expectedSalary;
        private String preferredJobType;
        private String preferredLocations;
        private LocalDate availableFrom;
        
        // Basic fields
        private String currentRole;
        private Integer totalExperienceYears;
        private Integer totalExperienceMonths;
        private String skills;
        private String summary;
        private String linkedinUrl;
        private String githubUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileResponse {
        private Long id;
        private String fullName;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private LocalDate dateOfBirth;
        private String gender;
        private String city;
        private String state;
        private String pincode;
        
        // Career preferences
        private String noticePeriod;
        private String currentSalary;
        private String expectedSalary;
        private String preferredJobType;
        private String preferredLocations;
        private LocalDate availableFrom;
        
        // Basic info
        private String currentRole;
        private Integer totalExperienceYears;
        private Integer totalExperienceMonths;
        private String skills;
        private String summary;
        private String resumeUrl;
        private String linkedinUrl;
        private String githubUrl;
        
        private String resumeFeedback;
        private String skillGaps;
        private String careerPaths;
        private Boolean hasResume;
        private Integer profileCompletionScore;
        private List<String> aiExtractedSections;

        // Nested lists
        private List<WorkExperienceDto.Response> experiences;
        private List<EducationDto.Response> educations;
        private List<CertificationDto.Response> certifications;
        private List<ProjectDto.Response> projects;
        private List<LanguageDto.Response> languages;
    }
}