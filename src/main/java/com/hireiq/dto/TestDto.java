package com.hireiq.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class TestDto {

    // ── What candidate receives when test starts ───────────────
    @Data @Builder
    public static class StartTestResponse {
        private Long attemptId;
        private String jobTitle;
        private Integer attemptNumber;
        private Integer totalQuestions;
        private List<QuestionResponse> questions;
        private String message;
    }

    // ── Single question (no correct answer exposed) ───────────
    @Data @Builder
    public static class QuestionResponse {
        private Integer questionNumber;
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        // correctAnswer deliberately NOT included here
    }

    // ── Candidate submits answers ──────────────────────────────
    // answers = { 1: "A", 2: "C", 3: "B", ... }
    @Data
    public static class SubmitTestRequest {
        private Map<Integer, String> answers;
    }

    // ── Result after submission ────────────────────────────────
    @Data @Builder
    public static class SubmitTestResponse {
        private Long attemptId;
        private Integer score;
        private Integer correctAnswers;
        private Integer totalQuestions;
        private String status;           // PASSED or FAILED
        private LocalDateTime nextAllowedAt;
        private String message;
        private String weakTopics;
        private String strengths;
        private String improvementSuggestions;
    }

    // ── Check if candidate can attempt ────────────────────────
    @Data @Builder
    public static class TestStatusResponse {
        private Boolean canAttempt;
        private Integer attemptNumber;
        private Integer lastScore;
        private LocalDateTime nextAllowedAt;
        private String message;
        private String weakTopics;
        private String strengths;
        private String improvementSuggestions;
    }
}