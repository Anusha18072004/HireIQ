package com.hireiq.service;

import com.hireiq.dto.SuggestionDto;
import com.hireiq.entity.Application;
import com.hireiq.entity.CandidateProfile;
import com.hireiq.repository.ApplicationRepository;
import com.hireiq.repository.CandidateProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SuggestionService {

    private final AiService aiService;
    private final CandidateProfileRepository profileRepository;
    private final ApplicationRepository applicationRepository;

    @Transactional
    public void generateProfileSuggestions(CandidateProfile profile) {
        log.info("Generating Career Coach Profile suggestions for candidate: {}", profile.getUser().getEmail());
        try {
            SuggestionDto.ProfileSuggestions suggestions = aiService.generateProfileSuggestions(
                    profile.getResumeRawText() != null ? profile.getResumeRawText() : "",
                    profile.getSkills() != null ? profile.getSkills() : "",
                    profile.getCurrentRole() != null ? profile.getCurrentRole() : "",
                    profile.getTotalExperienceYears() != null ? profile.getTotalExperienceYears() : 0
            );

            profile.setResumeFeedback(suggestions.getResumeFeedback());
            profile.setSkillGaps(suggestions.getSkillGaps());
            profile.setCareerPaths(suggestions.getCareerPaths());

            profileRepository.save(profile);
            log.info("Successfully saved profile suggestions for candidate: {}", profile.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to generate or save profile suggestions: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void generateMatchSuggestions(Application application) {
        log.info("Generating Career Coach Match suggestions for application ID: {}", application.getId());
        try {
            CandidateProfile profile = profileRepository.findByUser(application.getCandidate())
                    .orElse(null);

            SuggestionDto.MatchSuggestions suggestions = aiService.generateMatchSuggestions(
                    profile,
                    application.getJob()
            );

            application.setTailoringSuggestions(suggestions.getTailoringSuggestions());
            application.setInterviewTips(suggestions.getInterviewTips());
            application.setUpskillingRoadmap(suggestions.getUpskillingRoadmap());
            application.setHonestReview(suggestions.getHonestReview());

            applicationRepository.save(application);
            log.info("Successfully saved match suggestions for application ID: {}", application.getId());
        } catch (Exception e) {
            log.error("Failed to generate or save match suggestions: {}", e.getMessage(), e);
        }
    }
}
