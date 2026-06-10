package com.hireiq.dto;

import lombok.*;

public class CertificationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String certificationName;
        private String issuingOrganization;
        private String issueMonth;
        private Integer issueYear;
        private String expiryMonth;
        private Integer expiryYear;
        private Boolean doesNotExpire;
        private String credentialId;
        private String credentialUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String certificationName;
        private String issuingOrganization;
        private String issueMonth;
        private Integer issueYear;
        private String expiryMonth;
        private Integer expiryYear;
        private Boolean doesNotExpire;
        private String credentialId;
        private String credentialUrl;
        private Boolean isAiExtracted;
    }
}
