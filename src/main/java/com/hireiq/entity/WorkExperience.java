package com.hireiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "work_experiences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_profile_id", nullable = false)
    @JsonIgnore
    private CandidateProfile candidateProfile;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "employment_type")
    private String employmentType; // "Full Time", "Part Time", "Internship", "Freelance"

    private String startMonth;
    private Integer startYear;
    private String endMonth;
    private Integer endYear;

    @Builder.Default
    private Boolean isCurrentJob = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String skills; // skills used in this job

    private String location;
    
    private Integer orderIndex;

    @Builder.Default
    private Boolean isAiExtracted = false;
}
