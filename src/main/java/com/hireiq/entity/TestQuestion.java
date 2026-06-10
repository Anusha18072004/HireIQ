package com.hireiq.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TestQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private TestAttempt attempt;

    // Question number within this attempt (1-20)
    private Integer questionNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(nullable = false)
    private String optionA;

    @Column(nullable = false)
    private String optionB;

    @Column(nullable = false)
    private String optionC;

    @Column(nullable = false)
    private String optionD;

    // The correct answer: "A", "B", "C", or "D"
    @Column(nullable = false)
    private String correctAnswer;

    // What the candidate answered — null until submitted
    private String candidateAnswer;

    // Whether the candidate got this question right
    private Boolean isCorrect;
}