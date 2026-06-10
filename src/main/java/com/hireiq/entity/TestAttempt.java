package com.hireiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_attempts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobPosting job;

    // Which attempt number this is (1st, 2nd, 3rd...)
    @Builder.Default
    private Integer attemptNumber = 1;

    // Score as percentage 0-100, null until test is submitted
    private Integer score;

    // Status of this attempt
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    // When this attempt was started
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime attemptedAt;

    // When the candidate can attempt again (set after failed attempt)
    // null means no restriction
    private LocalDateTime nextAllowedAt;

    @Column(columnDefinition = "TEXT")
    private String weakTopics;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String improvementSuggestions;

    // ── Cooldown rules ─────────────────────────────────────────
    // score >= 75  → PASSED,  no cooldown
    // score 50-74  → FAILED,  retry after 4 days
    // score 30-49  → FAILED,  retry after 10 days
    // score < 30   → BLOCKED, retry after 30 days

    public enum AttemptStatus {
        IN_PROGRESS,  // test started, not yet submitted
        PASSED,       // score >= 75%
        FAILED        // score < 75%, cooldown applied
    }
}