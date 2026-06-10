package com.hireiq.service;

import com.hireiq.dto.ApplicationDto;
import com.hireiq.entity.Application;
import com.hireiq.entity.CandidateProfile;
import com.hireiq.entity.JobPosting;
import com.hireiq.entity.User;
import com.hireiq.repository.ApplicationRepository;
import com.hireiq.repository.CandidateProfileRepository;
import com.hireiq.repository.JobPostingRepository;
import com.hireiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.hireiq.entity.TestAttempt;
import com.hireiq.repository.TestAttemptRepository;
import java.util.Optional;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;
    private final TestAttemptRepository attemptRepository;
    private final AiService aiService;
    private final SuggestionService suggestionService;

    @Transactional
    public ApplicationDto.ApplicationResponse apply(Long jobId, String candidateEmail) {

        User candidate = findUserByEmail(candidateEmail);
        JobPosting job = findJobById(jobId);

        if (candidate.getRole() != User.Role.CANDIDATE) {
            throw new RuntimeException("Only candidates can apply for jobs.");
        }
        if (job.getStatus() != JobPosting.JobStatus.ACTIVE) {
            throw new RuntimeException("This job is no longer accepting applications.");
        }

        CandidateProfile profile = profileRepository.findByUser(candidate)
                .orElseThrow(() -> new RuntimeException(
                        "Please create your profile and upload your resume before applying."));

        if (profile.getResumeUrl() == null) {
            throw new RuntimeException("Please upload your resume (PDF) before applying.");
        }

        if (applicationRepository.existsByCandidateAndJob(candidate, job)) {
            throw new RuntimeException("You have already applied for this job.");
        }

        log.info("Calculating AI match score for candidate {} on job {}", candidateEmail, jobId);

        AiService.MatchResult matchResult = aiService.calculateMatch(profile, job);

        int score = matchResult.score();
        Application.ApplicationStatus status;
        String reason = matchResult.reason();

        if (!matchResult.knockoutPass()) {
            score = 0;
            status = Application.ApplicationStatus.REJECTED;
            reason = "Auto-rejected: Failed knockout requirement. Question failed: '" 
                    + matchResult.failedKnockoutQuestion() + "'. Reason: " + matchResult.reason();
        } else {
            status = score >= 75
                    ? Application.ApplicationStatus.SHORTLISTED
                    : Application.ApplicationStatus.REJECTED;
        }

        log.info("Match score for {}: {}% -> {}", candidateEmail, score, status);

        Application application = Application.builder()
                .candidate(candidate)
                .job(job)
                .matchScore(score)
                .matchReason(reason)
                .status(status)
                .build();

        Application saved = applicationRepository.save(application);
        suggestionService.generateMatchSuggestions(saved);

        return toResponse(saved);
    }

    public List<ApplicationDto.ApplicationResponse> getMyApplications(String email) {
        User candidate = findUserByEmail(email);
        return applicationRepository.findByCandidate(candidate)
                .stream().map(this::toResponse).toList();
    }

    public List<ApplicationDto.ApplicationResponse> getApplicationsForJob(
            Long jobId, String recruiterEmail) {
        JobPosting job = findJobById(jobId);
        if (!job.getRecruiter().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("You are not authorised to view these applications.");
        }
        return applicationRepository.findByJobOrderByMatchScoreDesc(job)
                .stream().map(this::toResponse).toList();
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private JobPosting findJobById(Long id) {
        return jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    public ApplicationDto.ApplicationResponse toResponse(Application a) {
        Optional<TestAttempt> lastAttempt = attemptRepository.findTopByCandidateAndJobOrderByAttemptNumberDesc(
                a.getCandidate(), a.getJob());

        return ApplicationDto.ApplicationResponse.builder()
                .id(a.getId())
                .jobId(a.getJob().getId())
                .jobTitle(a.getJob().getTitle())
                .recruiterName(a.getJob().getRecruiter().getFullName())
                .candidateName(a.getCandidate().getFullName())
                .candidateEmail(a.getCandidate().getEmail())
                .matchScore(a.getMatchScore())
                .matchReason(a.getMatchReason())
                .status(a.getStatus().name())
                .tailoringSuggestions(a.getTailoringSuggestions())
                .interviewTips(a.getInterviewTips())
                .upskillingRoadmap(a.getUpskillingRoadmap())
                .honestReview(a.getHonestReview())
                .testWeakTopics(lastAttempt.map(TestAttempt::getWeakTopics).orElse(null))
                .testStrengths(lastAttempt.map(TestAttempt::getStrengths).orElse(null))
                .testImprovementSuggestions(lastAttempt.map(TestAttempt::getImprovementSuggestions).orElse(null))
                .testScore(lastAttempt.map(TestAttempt::getScore).orElse(null))
                .appliedAt(a.getAppliedAt())
                .build();
    }

    public List<ApplicationDto.ApplicationResponse> searchCandidatesSemantically(
            Long jobId, String query, String recruiterEmail) {
        
        JobPosting job = findJobById(jobId);
        if (!job.getRecruiter().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("You are not authorised to view these applications.");
        }

        List<Application> apps = applicationRepository.findByJobOrderByMatchScoreDesc(job);
        if (apps.isEmpty()) {
            return List.of();
        }

        log.info("Computing semantic search embeddings for query: '{}'", query);
        float[] queryEmbedding = aiService.getEmbedding(query);

        List<ApplicationWithSimilarity> ranked = new ArrayList<>();
        for (Application app : apps) {
            CandidateProfile profile = profileRepository.findByUser(app.getCandidate()).orElse(null);
            if (profile == null) continue;

            String textToEmbed = String.format("Role: %s\nSkills: %s\nSummary: %s\nEducation: %s",
                    profile.getCurrentRole() != null ? profile.getCurrentRole() : "",
                    profile.getSkills() != null ? profile.getSkills() : "",
                    profile.getSummary() != null ? profile.getSummary() : "",
                    profile.getEducation() != null ? profile.getEducation() : ""
            );

            float[] profileEmbedding = aiService.getEmbedding(textToEmbed);
            double similarity = aiService.calculateCosineSimilarity(queryEmbedding, profileEmbedding);

            ranked.add(new ApplicationWithSimilarity(app, similarity));
        }

        ranked.sort((a, b) -> Double.compare(b.similarity, a.similarity));

        return ranked.stream()
                .map(r -> {
                    ApplicationDto.ApplicationResponse response = toResponse(r.application);
                    int scorePct = (int) Math.round(r.similarity * 100);
                    scorePct = Math.max(0, Math.min(100, scorePct));

                    response.setMatchReason(String.format("[Semantic Relevance: %d%%] %s", scorePct, response.getMatchReason()));
                    return response;
                })
                .toList();
    }

    private static class ApplicationWithSimilarity {
        final Application application;
        final double similarity;

        ApplicationWithSimilarity(Application application, double similarity) {
            this.application = application;
            this.similarity = similarity;
        }
    }
}