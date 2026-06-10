package com.hireiq.dto;

import lombok.*;

public class LanguageDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String languageName;
        private String proficiency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String languageName;
        private String proficiency;
        private Boolean isAiExtracted;
    }
}
