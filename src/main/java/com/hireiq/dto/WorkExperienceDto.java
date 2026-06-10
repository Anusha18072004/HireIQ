package com.hireiq.dto;

import lombok.*;

public class WorkExperienceDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String companyName;
        private String jobTitle;
        private String employmentType;
        private String startMonth;
        private Integer startYear;
        private String endMonth;
        private Integer endYear;
        private Boolean isCurrentJob;
        private String description;
        private String skills;
        private String location;
        private Integer orderIndex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String companyName;
        private String jobTitle;
        private String employmentType;
        private String startMonth;
        private Integer startYear;
        private String endMonth;
        private Integer endYear;
        private Boolean isCurrentJob;
        private String description;
        private String skills;
        private String location;
        private Integer orderIndex;
        private Boolean isAiExtracted;
    }
}
