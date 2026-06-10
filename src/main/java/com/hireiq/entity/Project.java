package com.hireiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "projects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_profile_id", nullable = false)
    @JsonIgnore
    private CandidateProfile candidateProfile;

    @Column(name = "project_title", nullable = false)
    private String projectTitle;

    @Column(name = "project_description", columnDefinition = "TEXT")
    private String projectDescription;

    @Column(name = "technologies_used", columnDefinition = "TEXT")
    private String technologiesUsed; // comma separated

    @Column(length = 500)
    private String projectUrl;

    @Column(length = 500)
    private String githubUrl;

    private String startMonth;
    private Integer startYear;
    private String endMonth;
    private Integer endYear;

    @Builder.Default
    private Boolean isOngoing = false;

    private Integer orderIndex;

    @Builder.Default
    private Boolean isAiExtracted = false;
}
