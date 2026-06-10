package com.hireiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_postings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The recruiter who posted this job
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    // Comma-separated required skills e.g. "Java,Spring Boot,PostgreSQL"
    @Column(nullable = false, columnDefinition = "TEXT")
    private String requiredSkills;

    private String location;

    private String experienceRequired; // e.g. "2-4 years"

    private String salaryRange; // e.g. "5-8 LPA"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.ACTIVE;

    // Core Job Details
    private String employmentType; // Full Time, Internship, Part Time, Contract, Freelance
    private String workMode; // Remote, Hybrid, Onsite
    private Integer openings;
    private String department; // Engineering, Marketing, HR, Sales, Design, Operations
    private String seniority; // Intern, Junior, Mid-Level, Senior, Lead
    private String applicationDeadline;
    private String noticePeriodPreference; // Immediate, 15 Days, 30 Days, 60+ Days
    private String educationRequirement; // B.Tech, MCA, MBA, Any Degree
    private Double minCgpa;
    @Column(columnDefinition = "TEXT")
    private String preferredColleges;
    @Column(columnDefinition = "TEXT")
    private String preferredSkills;

    // Compensation
    private String salaryType; // Fixed, Fixed + Bonus, Stipend
    private String currency;
    private Boolean hideSalary;

    // Location
    private String country;
    private String state;
    private String city;

    // Hiring Flow
    @Column(columnDefinition = "TEXT")
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
    @Column(columnDefinition = "TEXT")
    private String knockoutQuestions;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum JobStatus {
        ACTIVE,     // accepting applications
        CLOSED,     // no longer accepting
        DRAFT       // saved but not published
    }
}