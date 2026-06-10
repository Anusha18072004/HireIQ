package com.hireiq.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

public class ApplicationDto {

    @Data @Builder
    public static class ApplicationResponse {
        private Long id;
        private Long jobId;
        private String jobTitle;
        private String recruiterName;
        private String candidateName;
        private String candidateEmail;
        private Integer matchScore;
        private String matchReason;
        private String status;
        private String tailoringSuggestions;
        private String interviewTips;
        private String upskillingRoadmap;
        private String honestReview;
        private String testWeakTopics;
        private String testStrengths;
        private String testImprovementSuggestions;
        private Integer testScore;
        private LocalDateTime appliedAt;
    }
}