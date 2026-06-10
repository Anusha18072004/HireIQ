package com.hireiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String resumeUrl;

    @Column(columnDefinition = "TEXT")
    private String resumeRawText;

    @Column(columnDefinition = "TEXT")
    private String skills;

    private Integer yearsOfExperience;

    @Column(name = "job_title")   // ← maps Java field to safe column name
    private String currentRole;

    private String education;

    private String phone;

    private String linkedinUrl;

    private String githubUrl;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "date_of_birth")
    private java.time.LocalDate dateOfBirth;

    @Column(length = 20)
    private String gender;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 10)
    private String pincode;

    @Column(name = "notice_period", length = 50)
    private String noticePeriod;

    @Column(name = "current_salary", length = 50)
    private String currentSalary;

    @Column(name = "expected_salary", length = 50)
    private String expectedSalary;

    @Column(name = "preferred_job_type", length = 50)
    private String preferredJobType;

    @Column(name = "preferred_locations", columnDefinition = "TEXT")
    private String preferredLocations; // comma-separated

    private Integer totalExperienceYears;
    private Integer totalExperienceMonths;
    private Integer profileCompletionScore;

    private java.time.LocalDate availableFrom;

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<WorkExperience> experiences = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<Education> educations = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<Certification> certifications = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<Project> projects = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<Language> languages = new java.util.ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String resumeFeedback;

    @Column(columnDefinition = "TEXT")
    private String skillGaps;

    @Column(columnDefinition = "TEXT")
    private String careerPaths;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}