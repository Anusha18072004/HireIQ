package com.hireiq.dto;

import lombok.Builder;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class JobDto {

    @Data
    public static class JobRequest {
        @NotBlank(message = "Job title is required")
        private String title;

        @NotBlank(message = "Job description is required")
        private String description;

        @NotBlank(message = "Required skills are required")
        private String requiredSkills;   // e.g. "Java, Spring Boot, React"

        private String location;
        private String experienceRequired;
        private String salaryRange;
        private String status; // Allow setting status e.g. DRAFT or ACTIVE

        // Core Job Details
        private String employmentType;
        private String workMode;
        private Integer openings;
        private String department;
        private String seniority;
        private String applicationDeadline;
        private String noticePeriodPreference;
        private String educationRequirement;
        private Double minCgpa;
        private String preferredColleges;
        private String preferredSkills;

        // Compensation
        private String salaryType;
        private String currency;
        private Boolean hideSalary;

        // Location
        private String country;
        private String state;
        private String city;

        // Hiring Flow
        private String hiringSteps;
        private String expectedJoiningDate;
        private Boolean easyApply;
        private Boolean resumeRequired;
        private Boolean portfolioRequired;

        // AI Matching weights
        private Integer aiWeightSkills;
        private Integer aiWeightExperience;
        private Integer aiWeightEducation;
        private Integer aiWeightProjects;

        // Knockout Questions
        private String knockoutQuestions;
    }

    @Data @Builder
    public static class JobResponse {
        private Long id;
        private String title;
        private String description;
        private String requiredSkills;
        private String location;
        private String experienceRequired;
        private String salaryRange;
        private String status;
        private String recruiterName;
        private LocalDateTime createdAt;

        // Core Job Details
        private String employmentType;
        private String workMode;
        private Integer openings;
        private String department;
        private String seniority;
        private String applicationDeadline;
        private String noticePeriodPreference;
        private String educationRequirement;
        private Double minCgpa;
        private String preferredColleges;
        private String preferredSkills;

        // Compensation
        private String salaryType;
        private String currency;
        private Boolean hideSalary;

        // Location
        private String country;
        private String state;
        private String city;

        // Hiring Flow
        private String hiringSteps;
        private String expectedJoiningDate;
        private Boolean easyApply;
        private Boolean resumeRequired;
        private Boolean portfolioRequired;

        // AI Matching weights
        private Integer aiWeightSkills;
        private Integer aiWeightExperience;
        private Integer aiWeightEducation;
        private Integer aiWeightProjects;

        // Knockout Questions
        private String knockoutQuestions;
    }
}