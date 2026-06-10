package com.hireiq.service;

import com.hireiq.dto.*;
import com.hireiq.entity.*;
import com.hireiq.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final WorkExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final CertificationRepository certificationRepository;
    private final ProjectRepository projectRepository;
    private final LanguageRepository languageRepository;
    private final CloudinaryService cloudinaryService;
    private final SuggestionService suggestionService;
    private final AiService aiService;

    // ── 1. GET FULL PROFILE ─────────────────────────────────────
    @Transactional
    public ProfileDto.ProfileResponse getMyProfile(String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseGet(() -> profileRepository.save(
                        CandidateProfile.builder().user(user).build()));
        return toResponse(profile);
    }

    // ── 2. CREATE or UPDATE BASIC PROFILE INFO ──────────────────
    @Transactional
    public ProfileDto.ProfileResponse saveProfile(ProfileDto.ProfileRequest request, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElse(CandidateProfile.builder().user(user).build());

        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setPhone(request.getPhone());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setPincode(request.getPincode());

        profile.setNoticePeriod(request.getNoticePeriod());
        profile.setCurrentSalary(request.getCurrentSalary());
        profile.setExpectedSalary(request.getExpectedSalary());
        profile.setPreferredJobType(request.getPreferredJobType());
        profile.setPreferredLocations(request.getPreferredLocations());
        profile.setAvailableFrom(request.getAvailableFrom());

        profile.setCurrentRole(request.getCurrentRole());
        profile.setTotalExperienceYears(request.getTotalExperienceYears());
        profile.setTotalExperienceMonths(request.getTotalExperienceMonths());
        profile.setSkills(request.getSkills());
        profile.setSummary(request.getSummary());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setGithubUrl(request.getGithubUrl());

        profileRepository.save(profile);
        updateAndSaveCompletionScore(profile);

        return toResponse(profile);
    }

    // ── 3. PROFILE COMPLETION STATS ─────────────────────────────
    public Map<String, Object> getProfileCompletion(String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElse(CandidateProfile.builder().user(user).build());

        int score = 0;
        List<String> missingItems = new ArrayList<>();

        boolean nameFilled = (profile.getFirstName() != null && !profile.getFirstName().trim().isEmpty())
                || (profile.getUser().getFullName() != null && !profile.getUser().getFullName().trim().isEmpty());
        boolean phoneFilled = profile.getPhone() != null && !profile.getPhone().trim().isEmpty();
        boolean cityFilled = profile.getCity() != null && !profile.getCity().trim().isEmpty();
        if (nameFilled && phoneFilled && cityFilled) {
            score += 15;
        } else {
            missingItems.add("Basic info (name, phone, city)");
        }

        if (profile.getSummary() != null && !profile.getSummary().trim().isEmpty()) {
            score += 10;
        } else {
            missingItems.add("Professional summary");
        }

        List<WorkExperience> experiences = experienceRepository.findByCandidateProfileOrderByOrderIndexAsc(profile);
        if (!experiences.isEmpty()) {
            score += 20;
        } else {
            missingItems.add("At least one work experience");
        }

        List<Education> educations = educationRepository.findByCandidateProfileOrderByOrderIndexAsc(profile);
        if (!educations.isEmpty()) {
            score += 15;
        } else {
            missingItems.add("At least one education detail");
        }

        int skillCount = 0;
        if (profile.getSkills() != null) {
            String[] split = profile.getSkills().split(",");
            for (String s : split) {
                if (!s.trim().isEmpty()) skillCount++;
            }
        }
        if (skillCount >= 5) {
            score += 15;
        } else {
            missingItems.add("At least 5 skills (current count: " + skillCount + ")");
        }

        if (profile.getResumeUrl() != null && !profile.getResumeUrl().trim().isEmpty()) {
            score += 15;
        } else {
            missingItems.add("Resume PDF upload");
        }

        List<Project> projects = projectRepository.findByCandidateProfileOrderByOrderIndexAsc(profile);
        if (!projects.isEmpty()) {
            score += 5;
        } else {
            missingItems.add("At least one project");
        }

        if (profile.getLinkedinUrl() != null && !profile.getLinkedinUrl().trim().isEmpty()) {
            score += 5;
        } else {
            missingItems.add("LinkedIn profile link");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("score", score);
        result.put("missingItems", missingItems);
        return result;
    }

    private void updateAndSaveCompletionScore(CandidateProfile profile) {
        Map<String, Object> completion = getProfileCompletion(profile.getUser().getEmail());
        int score = (int) completion.get("score");
        profile.setProfileCompletionScore(score);
        profileRepository.save(profile);
    }

    // ── 4. RESUME UPLOAD AND PARSING AUTOFILL ───────────────────
    @Transactional
    public ProfileDto.ProfileResponse uploadResume(MultipartFile file, String email) throws IOException {
        // Validate PDF content type
        String contentType = file.getContentType();
        boolean isPdf = contentType != null && (
                contentType.equals("application/pdf") ||
                contentType.equals("application/octet-stream") ||
                contentType.equals("application/x-pdf") ||
                (file.getOriginalFilename() != null && file.getOriginalFilename().toLowerCase().endsWith(".pdf"))
        );
        if (!isPdf) {
            throw new IllegalArgumentException("Only PDF files are accepted for resumes.");
        }

        User user = findUserByEmail(email);

        // Always persist the profile first so child deletes work correctly.
        // deleteByCandidateProfileAndIsAiExtracted needs a real DB id.
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseGet(() -> profileRepository.save(
                        CandidateProfile.builder().user(user).build()));

        // Upload PDF to Cloudinary first — fail fast before AI processing
        String resumeUrl = cloudinaryService.uploadResume(file, email);

        // Extract text from PDF; fall back to empty string if extraction fails
        String rawText = extractTextFromPdf(file);
        log.info("Extracted {} chars of text from resume PDF for {}", rawText.length(), email);

        // Call AI to parse the resume
        AiService.ParsedResume parsed = aiService.parseResume(rawText);

        profile.setResumeUrl(resumeUrl);
        profile.setResumeRawText(rawText);

        List<String> aiExtractedSections = new ArrayList<>();

        if (parsed != null) {
            // Basic info — only overwrite if AI extracted something useful
            if (parsed.getSkills() != null && !parsed.getSkills().isEmpty()) {
                profile.setSkills(String.join(", ", parsed.getSkills()));
            }
            if (parsed.getSummary() != null && !parsed.getSummary().isBlank()) {
                profile.setSummary(parsed.getSummary());
            }
            if (parsed.getCurrentRole() != null && !parsed.getCurrentRole().isBlank()) {
                profile.setCurrentRole(parsed.getCurrentRole());
            }
            if (parsed.getTotalYearsExperience() > 0) {
                profile.setTotalExperienceYears(parsed.getTotalYearsExperience());
                profile.setYearsOfExperience(parsed.getTotalYearsExperience());
            }
            if (parsed.getCity() != null && !parsed.getCity().isBlank()) {
                profile.setCity(parsed.getCity());
            }
            if (parsed.getState() != null && !parsed.getState().isBlank()) {
                profile.setState(parsed.getState());
            }
            if (parsed.getPhone() != null && !parsed.getPhone().isBlank()) {
                profile.setPhone(parsed.getPhone());
            }
            if (parsed.getFullName() != null && !parsed.getFullName().isBlank()) {
                String[] parts = parsed.getFullName().trim().split("\\s+");
                if (parts.length > 0) {
                    profile.setFirstName(parts[0]);
                    profile.setLastName(parts.length > 1 ? parts[parts.length - 1] : "");
                }
            }

            // Persist the profile now so child deletes work correctly
            profileRepository.saveAndFlush(profile);

            // Delete existing AI-extracted records before saving new ones
            experienceRepository.deleteByCandidateProfileAndIsAiExtracted(profile, true);
            educationRepository.deleteByCandidateProfileAndIsAiExtracted(profile, true);
            projectRepository.deleteByCandidateProfileAndIsAiExtracted(profile, true);
            certificationRepository.deleteByCandidateProfileAndIsAiExtracted(profile, true);

            // Flush deletes to DB immediately
            experienceRepository.flush();
            educationRepository.flush();
            projectRepository.flush();
            certificationRepository.flush();

            // Clear the cached Hibernate collections so new inserts don't conflict
            profile.getExperiences().clear();
            profile.getEducations().clear();
            profile.getProjects().clear();
            profile.getCertifications().clear();
            profile.getLanguages().clear();

            // Save extracted work experiences
            if (parsed.getWorkExperiences() != null) {
                int saved = 0;
                for (int i = 0; i < parsed.getWorkExperiences().size(); i++) {
                    AiService.WorkExpData we = parsed.getWorkExperiences().get(i);
                    if ((we.getCompanyName() == null || we.getCompanyName().isBlank())
                            && (we.getJobTitle() == null || we.getJobTitle().isBlank())) {
                        continue;
                    }
                    WorkExperience exp = WorkExperience.builder()
                            .candidateProfile(profile)
                            .companyName(we.getCompanyName())
                            .jobTitle(we.getJobTitle())
                            .employmentType(we.getEmploymentType())
                            .startMonth(we.getStartMonth())
                            .startYear(we.getStartYear())
                            .endMonth(we.getEndMonth())
                            .endYear(we.getEndYear())
                            .isCurrentJob(we.isCurrentJob())
                            .description(we.getDescription())
                            .location(we.getLocation())
                            .skills(we.getSkillsUsed() != null ? String.join(", ", we.getSkillsUsed()) : "")
                            .isAiExtracted(true)
                            .orderIndex(i)
                            .build();
                    experienceRepository.save(exp);
                    saved++;
                }
                if (saved > 0) aiExtractedSections.add("Experience (" + saved + " entries)");
            }

            // Save extracted educations
            if (parsed.getEducations() != null) {
                int saved = 0;
                for (int i = 0; i < parsed.getEducations().size(); i++) {
                    AiService.EducationData edu = parsed.getEducations().get(i);
                    if ((edu.getDegree() == null || edu.getDegree().isBlank())
                            && (edu.getInstituteName() == null || edu.getInstituteName().isBlank())) {
                        continue;
                    }
                    Education educationEntity = Education.builder()
                            .candidateProfile(profile)
                            .degree(edu.getDegree())
                            .fieldOfStudy(edu.getFieldOfStudy())
                            .instituteName(edu.getInstituteName())
                            .boardOrUniversity(edu.getBoardOrUniversity())
                            .startYear(edu.getStartYear())
                            .endYear(edu.getEndYear())
                            .grade(edu.getGrade())
                            .gradeType(edu.getGradeType())
                            .isCurrentlyStudying(edu.isCurrentlyStudying())
                            .isAiExtracted(true)
                            .orderIndex(i)
                            .build();
                    educationRepository.save(educationEntity);
                    saved++;
                }
                if (saved > 0) aiExtractedSections.add("Education (" + saved + " entries)");
            }

            // Save extracted projects
            if (parsed.getProjects() != null) {
                int saved = 0;
                for (int i = 0; i < parsed.getProjects().size(); i++) {
                    AiService.ProjectData pr = parsed.getProjects().get(i);
                    if (pr.getProjectTitle() == null || pr.getProjectTitle().isBlank()) {
                        continue;
                    }
                    Project projectEntity = Project.builder()
                            .candidateProfile(profile)
                            .projectTitle(pr.getProjectTitle())
                            .projectDescription(pr.getProjectDescription())
                            .technologiesUsed(pr.getTechnologiesUsed() != null ? String.join(", ", pr.getTechnologiesUsed()) : "")
                            .projectUrl(pr.getProjectUrl())
                            .githubUrl(pr.getGithubUrl())
                            .startMonth(pr.getStartMonth())
                            .startYear(pr.getStartYear())
                            .endMonth(pr.getEndMonth())
                            .endYear(pr.getEndYear())
                            .isOngoing(pr.isOngoing())
                            .isAiExtracted(true)
                            .orderIndex(i)
                            .build();
                    projectRepository.save(projectEntity);
                    saved++;
                }
                if (saved > 0) aiExtractedSections.add("Projects (" + saved + " entries)");
            }

            // Save extracted certifications
            if (parsed.getCertifications() != null) {
                int saved = 0;
                for (AiService.CertData cert : parsed.getCertifications()) {
                    if (cert.getCertificationName() == null || cert.getCertificationName().isBlank()) {
                        continue;
                    }
                    Certification certEntity = Certification.builder()
                            .candidateProfile(profile)
                            .certificationName(cert.getCertificationName())
                            .issuingOrganization(cert.getIssuingOrganization())
                            .issueMonth(cert.getIssueMonth())
                            .issueYear(cert.getIssueYear())
                            .expiryMonth("")
                            .expiryYear(cert.getExpiryYear())
                            .doesNotExpire(cert.isDoesNotExpire())
                            .credentialId(cert.getCredentialId())
                            .credentialUrl(cert.getCredentialUrl())
                            .isAiExtracted(true)
                            .build();
                    certificationRepository.save(certEntity);
                    saved++;
                }
                if (saved > 0) aiExtractedSections.add("Certifications (" + saved + " entries)");
            }

            // Save extracted languages — delete old AI languages first
            if (parsed.getLanguages() != null && !parsed.getLanguages().isEmpty()) {
                languageRepository.deleteByCandidateProfileAndIsAiExtracted(profile, true);
                languageRepository.flush();

                int saved = 0;
                for (AiService.LanguageData ld : parsed.getLanguages()) {
                    if (ld.getLanguageName() == null || ld.getLanguageName().isBlank()) continue;
                    Language lang = Language.builder()
                            .candidateProfile(profile)
                            .languageName(ld.getLanguageName().trim())
                            .proficiency(ld.getProficiency() != null ? ld.getProficiency() : "Proficient")
                            .isAiExtracted(true)
                            .build();
                    languageRepository.save(lang);
                    saved++;
                }
                if (saved > 0) aiExtractedSections.add("Languages (" + saved + " entries)");
            }
        }

        profileRepository.save(profile);
        updateAndSaveCompletionScore(profile);

        // Run AI career suggestions in the background — do NOT block the HTTP response.
        final String rawTextForAsync = rawText;
        final String skillsForAsync = profile.getSkills() != null ? profile.getSkills() : "";
        final String roleForAsync = profile.getCurrentRole() != null ? profile.getCurrentRole() : "";
        final int expForAsync = profile.getTotalExperienceYears() != null ? profile.getTotalExperienceYears() : 0;
        final Long profileIdForAsync = profile.getId();

        new Thread(() -> {
            try {
                com.hireiq.dto.SuggestionDto.ProfileSuggestions suggestions =
                        aiService.generateProfileSuggestions(rawTextForAsync, skillsForAsync, roleForAsync, expForAsync);
                profileRepository.findById(profileIdForAsync).ifPresent(p -> {
                    p.setResumeFeedback(suggestions.getResumeFeedback());
                    p.setSkillGaps(suggestions.getSkillGaps());
                    p.setCareerPaths(suggestions.getCareerPaths());
                    profileRepository.save(p);
                    log.info("Background AI suggestions saved for profile id={}", profileIdForAsync);
                });
            } catch (Exception e) {
                log.error("Background suggestion generation failed: {}", e.getMessage());
            }
        }, "resume-suggestions-thread").start();

        // Refetch to have Hibernate reload the lazy collections fresh from DB
        CandidateProfile updatedProfile = profileRepository.findById(profile.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found after upload"));

        ProfileDto.ProfileResponse response = toResponse(updatedProfile);
        response.setAiExtractedSections(aiExtractedSections);

        return response;
    }

    // ── 5. NESTED CRUD: WORK EXPERIENCE ─────────────────────────
    public List<WorkExperienceDto.Response> getExperiences(String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return experienceRepository.findByCandidateProfileOrderByOrderIndexAsc(profile)
                .stream().map(this::toWorkExperienceResponse).toList();
    }

    @Transactional
    public WorkExperienceDto.Response addExperience(WorkExperienceDto.Request req, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        WorkExperience exp = WorkExperience.builder()
                .candidateProfile(profile)
                .companyName(req.getCompanyName())
                .jobTitle(req.getJobTitle())
                .employmentType(req.getEmploymentType())
                .startMonth(req.getStartMonth())
                .startYear(req.getStartYear())
                .endMonth(req.getEndMonth())
                .endYear(req.getEndYear())
                .isCurrentJob(req.getIsCurrentJob() != null && req.getIsCurrentJob())
                .description(req.getDescription())
                .skills(req.getSkills())
                .location(req.getLocation())
                .orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : 0)
                .build();

        WorkExperience saved = experienceRepository.save(exp);
        profile.getExperiences().add(saved);
        updateAndSaveCompletionScore(profile);
        return toWorkExperienceResponse(saved);
    }

    @Transactional
    public WorkExperienceDto.Response updateExperience(Long id, WorkExperienceDto.Request req, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        WorkExperience exp = experienceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work experience not found"));

        if (!exp.getCandidateProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized update");
        }

        exp.setCompanyName(req.getCompanyName());
        exp.setJobTitle(req.getJobTitle());
        exp.setEmploymentType(req.getEmploymentType());
        exp.setStartMonth(req.getStartMonth());
        exp.setStartYear(req.getStartYear());
        exp.setEndMonth(req.getEndMonth());
        exp.setEndYear(req.getEndYear());
        exp.setIsCurrentJob(req.getIsCurrentJob() != null && req.getIsCurrentJob());
        exp.setDescription(req.getDescription());
        exp.setSkills(req.getSkills());
        exp.setLocation(req.getLocation());
        if (req.getOrderIndex() != null) {
            exp.setOrderIndex(req.getOrderIndex());
        }

        WorkExperience saved = experienceRepository.save(exp);
        updateAndSaveCompletionScore(profile);
        return toWorkExperienceResponse(saved);
    }

    @Transactional
    public void deleteExperience(Long id, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        WorkExperience exp = experienceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work experience not found"));

        if (!exp.getCandidateProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized delete");
        }

        profile.getExperiences().remove(exp);
        experienceRepository.delete(exp);
        updateAndSaveCompletionScore(profile);
    }

    // ── 6. NESTED CRUD: EDUCATION ───────────────────────────────
    public List<EducationDto.Response> getEducations(String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return educationRepository.findByCandidateProfileOrderByOrderIndexAsc(profile)
                .stream().map(this::toEducationResponse).toList();
    }

    @Transactional
    public EducationDto.Response addEducation(EducationDto.Request req, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Education edu = Education.builder()
                .candidateProfile(profile)
                .degree(req.getDegree())
                .fieldOfStudy(req.getFieldOfStudy())
                .instituteName(req.getInstituteName())
                .boardOrUniversity(req.getBoardOrUniversity())
                .startYear(req.getStartYear())
                .endYear(req.getEndYear())
                .grade(req.getGrade())
                .gradeType(req.getGradeType())
                .isCurrentlyStudying(req.getIsCurrentlyStudying() != null && req.getIsCurrentlyStudying())
                .orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : 0)
                .build();

        Education saved = educationRepository.save(edu);
        profile.getEducations().add(saved);
        updateAndSaveCompletionScore(profile);
        return toEducationResponse(saved);
    }

    @Transactional
    public EducationDto.Response updateEducation(Long id, EducationDto.Request req, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Education edu = educationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Education detail not found"));

        if (!edu.getCandidateProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized update");
        }

        edu.setDegree(req.getDegree());
        edu.setFieldOfStudy(req.getFieldOfStudy());
        edu.setInstituteName(req.getInstituteName());
        edu.setBoardOrUniversity(req.getBoardOrUniversity());
        edu.setStartYear(req.getStartYear());
        edu.setEndYear(req.getEndYear());
        edu.setGrade(req.getGrade());
        edu.setGradeType(req.getGradeType());
        edu.setIsCurrentlyStudying(req.getIsCurrentlyStudying() != null && req.getIsCurrentlyStudying());
        if (req.getOrderIndex() != null) {
            edu.setOrderIndex(req.getOrderIndex());
        }

        Education saved = educationRepository.save(edu);
        updateAndSaveCompletionScore(profile);
        return toEducationResponse(saved);
    }

    @Transactional
    public void deleteEducation(Long id, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Education edu = educationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Education detail not found"));

        if (!edu.getCandidateProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized delete");
        }

        profile.getEducations().remove(edu);
        educationRepository.delete(edu);
        updateAndSaveCompletionScore(profile);
    }

    // ── 7. NESTED CRUD: CERTIFICATION ───────────────────────────
    @Transactional
    public CertificationDto.Response addCertification(CertificationDto.Request req, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Certification cert = Certification.builder()
                .candidateProfile(profile)
                .certificationName(req.getCertificationName())
                .issuingOrganization(req.getIssuingOrganization())
                .issueMonth(req.getIssueMonth())
                .issueYear(req.getIssueYear())
                .expiryMonth(req.getExpiryMonth())
                .expiryYear(req.getExpiryYear())
                .doesNotExpire(req.getDoesNotExpire() != null && req.getDoesNotExpire())
                .credentialId(req.getCredentialId())
                .credentialUrl(req.getCredentialUrl())
                .build();

        Certification saved = certificationRepository.save(cert);
        profile.getCertifications().add(saved);
        updateAndSaveCompletionScore(profile);
        return toCertificationResponse(saved);
    }

    @Transactional
    public CertificationDto.Response updateCertification(Long id, CertificationDto.Request req, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Certification cert = certificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        if (!cert.getCandidateProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized update");
        }

        cert.setCertificationName(req.getCertificationName());
        cert.setIssuingOrganization(req.getIssuingOrganization());
        cert.setIssueMonth(req.getIssueMonth());
        cert.setIssueYear(req.getIssueYear());
        cert.setExpiryMonth(req.getExpiryMonth());
        cert.setExpiryYear(req.getExpiryYear());
        cert.setDoesNotExpire(req.getDoesNotExpire() != null && req.getDoesNotExpire());
        cert.setCredentialId(req.getCredentialId());
        cert.setCredentialUrl(req.getCredentialUrl());

        Certification saved = certificationRepository.save(cert);
        updateAndSaveCompletionScore(profile);
        return toCertificationResponse(saved);
    }

    @Transactional
    public void deleteCertification(Long id, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Certification cert = certificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        if (!cert.getCandidateProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized delete");
        }

        profile.getCertifications().remove(cert);
        certificationRepository.delete(cert);
        updateAndSaveCompletionScore(profile);
    }

    // ── 8. NESTED CRUD: PROJECT ─────────────────────────────────
    @Transactional
    public ProjectDto.Response addProject(ProjectDto.Request req, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Project proj = Project.builder()
                .candidateProfile(profile)
                .projectTitle(req.getProjectTitle())
                .projectDescription(req.getProjectDescription())
                .technologiesUsed(req.getTechnologiesUsed())
                .projectUrl(req.getProjectUrl())
                .githubUrl(req.getGithubUrl())
                .startMonth(req.getStartMonth())
                .startYear(req.getStartYear())
                .endMonth(req.getEndMonth())
                .endYear(req.getEndYear())
                .isOngoing(req.getIsOngoing() != null && req.getIsOngoing())
                .orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : 0)
                .build();

        Project saved = projectRepository.save(proj);
        profile.getProjects().add(saved);
        updateAndSaveCompletionScore(profile);
        return toProjectResponse(saved);
    }

    @Transactional
    public ProjectDto.Response updateProject(Long id, ProjectDto.Request req, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Project proj = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!proj.getCandidateProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized update");
        }

        proj.setProjectTitle(req.getProjectTitle());
        proj.setProjectDescription(req.getProjectDescription());
        proj.setTechnologiesUsed(req.getTechnologiesUsed());
        proj.setProjectUrl(req.getProjectUrl());
        proj.setGithubUrl(req.getGithubUrl());
        proj.setStartMonth(req.getStartMonth());
        proj.setStartYear(req.getStartYear());
        proj.setEndMonth(req.getEndMonth());
        proj.setEndYear(req.getEndYear());
        proj.setIsOngoing(req.getIsOngoing() != null && req.getIsOngoing());
        if (req.getOrderIndex() != null) {
            proj.setOrderIndex(req.getOrderIndex());
        }

        Project saved = projectRepository.save(proj);
        updateAndSaveCompletionScore(profile);
        return toProjectResponse(saved);
    }

    @Transactional
    public void deleteProject(Long id, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Project proj = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!proj.getCandidateProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized delete");
        }

        profile.getProjects().remove(proj);
        projectRepository.delete(proj);
        updateAndSaveCompletionScore(profile);
    }

    // ── 9. NESTED CRUD: LANGUAGE ────────────────────────────────
    @Transactional
    public LanguageDto.Response addLanguage(LanguageDto.Request req, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Language lang = Language.builder()
                .candidateProfile(profile)
                .languageName(req.getLanguageName())
                .proficiency(req.getProficiency())
                .build();

        Language saved = languageRepository.save(lang);
        profile.getLanguages().add(saved);
        updateAndSaveCompletionScore(profile);
        return toLanguageResponse(saved);
    }

    @Transactional
    public void deleteLanguage(Long id, String email) {
        User user = findUserByEmail(email);
        CandidateProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        Language lang = languageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Language not found"));

        if (!lang.getCandidateProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized delete");
        }

        profile.getLanguages().remove(lang);
        languageRepository.delete(lang);
        updateAndSaveCompletionScore(profile);
    }

    // ── 10. PDF TEXT EXTRACTOR ──────────────────────────────────
    private String extractTextFromPdf(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(bytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(document);
                // 8000 chars covers a typical 2-3 page resume
                return text.length() > 8000 ? text.substring(0, 8000) : text;
            }
        } catch (IOException e) {
            log.error("PDF text extraction failed: {}", e.getMessage());
            return "";
        }
    }

    // ── 11. MAP TO RESPONSE DTO ─────────────────────────────────
    // Uses ordered repository methods to avoid lazy-loading issues and ensure
    // correct ordering of nested lists.
    public ProfileDto.ProfileResponse toResponse(CandidateProfile p) {
        List<WorkExperienceDto.Response> experiences =
                experienceRepository.findByCandidateProfileOrderByOrderIndexAsc(p)
                        .stream().map(this::toWorkExperienceResponse).toList();

        List<EducationDto.Response> educations =
                educationRepository.findByCandidateProfileOrderByOrderIndexAsc(p)
                        .stream().map(this::toEducationResponse).toList();

        List<ProjectDto.Response> projects =
                projectRepository.findByCandidateProfileOrderByOrderIndexAsc(p)
                        .stream().map(this::toProjectResponse).toList();

        List<CertificationDto.Response> certifications =
                certificationRepository.findByCandidateProfile(p)
                        .stream().map(this::toCertificationResponse).toList();

        List<LanguageDto.Response> languages =
                languageRepository.findByCandidateProfile(p)
                        .stream().map(this::toLanguageResponse).toList();

        return ProfileDto.ProfileResponse.builder()
                .id(p.getId())
                .fullName(p.getUser().getFullName())
                .email(p.getUser().getEmail())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .phone(p.getPhone())
                .dateOfBirth(p.getDateOfBirth())
                .gender(p.getGender())
                .city(p.getCity())
                .state(p.getState())
                .pincode(p.getPincode())
                .noticePeriod(p.getNoticePeriod())
                .currentSalary(p.getCurrentSalary())
                .expectedSalary(p.getExpectedSalary())
                .preferredJobType(p.getPreferredJobType())
                .preferredLocations(p.getPreferredLocations())
                .availableFrom(p.getAvailableFrom())
                .currentRole(p.getCurrentRole())
                .totalExperienceYears(p.getTotalExperienceYears() != null ? p.getTotalExperienceYears() : 0)
                .totalExperienceMonths(p.getTotalExperienceMonths() != null ? p.getTotalExperienceMonths() : 0)
                .skills(p.getSkills())
                .summary(p.getSummary())
                .resumeUrl(p.getResumeUrl())
                .linkedinUrl(p.getLinkedinUrl())
                .githubUrl(p.getGithubUrl())
                .resumeFeedback(p.getResumeFeedback())
                .skillGaps(p.getSkillGaps())
                .careerPaths(p.getCareerPaths())
                .hasResume(p.getResumeUrl() != null && !p.getResumeUrl().isBlank())
                .profileCompletionScore(p.getProfileCompletionScore() != null ? p.getProfileCompletionScore() : 0)
                .experiences(experiences)
                .educations(educations)
                .certifications(certifications)
                .projects(projects)
                .languages(languages)
                .build();
    }

    private WorkExperienceDto.Response toWorkExperienceResponse(WorkExperience w) {
        return WorkExperienceDto.Response.builder()
                .id(w.getId())
                .companyName(w.getCompanyName())
                .jobTitle(w.getJobTitle())
                .employmentType(w.getEmploymentType())
                .startMonth(w.getStartMonth())
                .startYear(w.getStartYear())
                .endMonth(w.getEndMonth())
                .endYear(w.getEndYear())
                .isCurrentJob(w.getIsCurrentJob())
                .description(w.getDescription())
                .skills(w.getSkills())
                .location(w.getLocation())
                .orderIndex(w.getOrderIndex())
                .isAiExtracted(w.getIsAiExtracted())
                .build();
    }

    private EducationDto.Response toEducationResponse(Education e) {
        return EducationDto.Response.builder()
                .id(e.getId())
                .degree(e.getDegree())
                .fieldOfStudy(e.getFieldOfStudy())
                .instituteName(e.getInstituteName())
                .boardOrUniversity(e.getBoardOrUniversity())
                .startYear(e.getStartYear())
                .endYear(e.getEndYear())
                .grade(e.getGrade())
                .gradeType(e.getGradeType())
                .isCurrentlyStudying(e.getIsCurrentlyStudying())
                .orderIndex(e.getOrderIndex())
                .isAiExtracted(e.getIsAiExtracted())
                .build();
    }

    private CertificationDto.Response toCertificationResponse(Certification c) {
        return CertificationDto.Response.builder()
                .id(c.getId())
                .certificationName(c.getCertificationName())
                .issuingOrganization(c.getIssuingOrganization())
                .issueMonth(c.getIssueMonth())
                .issueYear(c.getIssueYear())
                .expiryMonth(c.getExpiryMonth())
                .expiryYear(c.getExpiryYear())
                .doesNotExpire(c.getDoesNotExpire())
                .credentialId(c.getCredentialId())
                .credentialUrl(c.getCredentialUrl())
                .isAiExtracted(c.getIsAiExtracted())
                .build();
    }

    private ProjectDto.Response toProjectResponse(Project pr) {
        return ProjectDto.Response.builder()
                .id(pr.getId())
                .projectTitle(pr.getProjectTitle())
                .projectDescription(pr.getProjectDescription())
                .technologiesUsed(pr.getTechnologiesUsed())
                .projectUrl(pr.getProjectUrl())
                .githubUrl(pr.getGithubUrl())
                .startMonth(pr.getStartMonth())
                .startYear(pr.getStartYear())
                .endMonth(pr.getEndMonth())
                .endYear(pr.getEndYear())
                .isOngoing(pr.getIsOngoing())
                .orderIndex(pr.getOrderIndex())
                .isAiExtracted(pr.getIsAiExtracted())
                .build();
    }

    private LanguageDto.Response toLanguageResponse(Language l) {
        return LanguageDto.Response.builder()
                .id(l.getId())
                .languageName(l.getLanguageName())
                .proficiency(l.getProficiency())
                .isAiExtracted(l.getIsAiExtracted())
                .build();
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}
