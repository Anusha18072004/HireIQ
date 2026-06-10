package com.hireiq.dto;

import lombok.*;

public class ProjectDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String projectTitle;
        private String projectDescription;
        private String technologiesUsed;
        private String projectUrl;
        private String githubUrl;
        private String startMonth;
        private Integer startYear;
        private String endMonth;
        private Integer endYear;
        private Boolean isOngoing;
        private Integer orderIndex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String projectTitle;
        private String projectDescription;
        private String technologiesUsed;
        private String projectUrl;
        private String githubUrl;
        private String startMonth;
        private Integer startYear;
        private String endMonth;
        private Integer endYear;
        private Boolean isOngoing;
        private Integer orderIndex;
        private Boolean isAiExtracted;
    }
}
