package com.hireiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "educations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_profile_id", nullable = false)
    @JsonIgnore
    private CandidateProfile candidateProfile;

    @Column(nullable = false)
    private String degree; // "B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "MBA", "12th", "10th"

    @Column(name = "field_of_study")
    private String fieldOfStudy;

    @Column(name = "institute_name")
    private String instituteName;

    @Column(name = "board_or_university")
    private String boardOrUniversity;

    private Integer startYear;
    private Integer endYear;
    
    private String grade; // CGPA or percentage
    
    private String gradeType; // "CGPA" or "Percentage"

    @Builder.Default
    private Boolean isCurrentlyStudying = false;

    private Integer orderIndex;

    @Builder.Default
    private Boolean isAiExtracted = false;
}
