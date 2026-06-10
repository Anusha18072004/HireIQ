package com.hireiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"candidate_id", "job_id"},
                name = "uk_candidate_job"   // one application per candidate per job
        ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobPosting job;

    // AI-calculated match score 0-100
    private Integer matchScore;

    // Short reason from AI e.g. "Candidate has 4 of 5 required skills"
    @Column(columnDefinition = "TEXT")
    private String matchReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String tailoringSuggestions;

    @Column(columnDefinition = "TEXT")
    private String interviewTips;

    @Column(columnDefinition = "TEXT")
    private String upskillingRoadmap;

    @Column(columnDefinition = "TEXT")
    private String honestReview;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime appliedAt;

    public enum ApplicationStatus {
        PENDING,        // match score being calculated
        SHORTLISTED,    // match >= 75%, eligible for test
        REJECTED,       // match < 75%
        TEST_PASSED,    // passed AI test (score >= 75%)
        TEST_FAILED,    // failed AI test (can retry based on score)
        HIRED,          // recruiter marked as hired
        WITHDRAWN       // candidate withdrew
    }
}