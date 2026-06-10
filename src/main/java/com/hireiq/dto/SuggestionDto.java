package com.hireiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class SuggestionDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileSuggestions {
        private String resumeFeedback;
        private String skillGaps;
        private String careerPaths;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchSuggestions {
        private String tailoringSuggestions;
        private String interviewTips;
        private String upskillingRoadmap;
        private String honestReview;
    }
}
