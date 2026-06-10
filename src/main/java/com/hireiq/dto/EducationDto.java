package com.hireiq.dto;

import lombok.*;

public class EducationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String degree;
        private String fieldOfStudy;
        private String instituteName;
        private String boardOrUniversity;
        private Integer startYear;
        private Integer endYear;
        private String grade;
        private String gradeType;
        private Boolean isCurrentlyStudying;
        private Integer orderIndex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String degree;
        private String fieldOfStudy;
        private String instituteName;
        private String boardOrUniversity;
        private Integer startYear;
        private Integer endYear;
        private String grade;
        private String gradeType;
        private Boolean isCurrentlyStudying;
        private Integer orderIndex;
        private Boolean isAiExtracted;
    }
}
