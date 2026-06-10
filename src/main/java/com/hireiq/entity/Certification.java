package com.hireiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "certifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_profile_id", nullable = false)
    @JsonIgnore
    private CandidateProfile candidateProfile;

    @Column(name = "certification_name", nullable = false)
    private String certificationName;

    @Column(name = "issuing_organization")
    private String issuingOrganization;

    private String issueMonth;
    private Integer issueYear;
    private String expiryMonth;
    private Integer expiryYear;

    @Builder.Default
    private Boolean doesNotExpire = false;

    private String credentialId;
    
    @Column(length = 500)
    private String credentialUrl;

    @Builder.Default
    private Boolean isAiExtracted = false;
}
