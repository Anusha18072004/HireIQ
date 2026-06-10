package com.hireiq.service;

import com.hireiq.dto.TestDto;
import com.hireiq.entity.*;
import com.hireiq.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * TestService — manages the full AI test lifecycle.
 *
 * Flow:
 *   1. startTest()    — check eligibility, generate 20 AI questions, save to DB
 *   2. submitTest()   — grade answers, calculate score, apply cooldown rules
 *   3. getMyStatus()  — check if candidate can attempt, and when
 *
 * Cooldown rules:
 *   score >= 75  → PASSED  — no cooldown, profile shown to recruiter
 *   score 50-74  → FAILED  — retry after 4 days
 *   score 30-49  → FAILED  — retry after 10 days
 *   score < 30   → BLOCKED — retry after 30 days
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TestService {

    private final TestAttemptRepository attemptRepository;
    private final TestQuestionRepository questionRepository;
    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    // ── START TEST ─────────────────────────────────────────────
    @Transactional
    public TestDto.StartTestResponse startTest(Long jobId, String candidateEmail) {

        User candidate = findUserByEmail(candidateEmail);
        JobPosting job = findJobById(jobId);

        // 1. Candidate must have applied and been shortlisted
        Application application = applicationRepository
                .findByCandidateAndJob(candidate, job)
                .orElseThrow(() -> new RuntimeException(
                        "You have not applied for this job yet."));

        if (application.getStatus() != Application.ApplicationStatus.SHORTLISTED) {
            throw new RuntimeException(
                    "You are not eligible for this test. " +
                            "Your application status is: " + application.getStatus());
        }

        // 2. Check if already passed
        boolean alreadyPassed = attemptRepository.existsByCandidateAndJobAndStatus(
                candidate, job, TestAttempt.AttemptStatus.PASSED);
        if (alreadyPassed) {
            throw new RuntimeException("You have already passed the test for this job!");
        }

        // 3. Check cooldown from last failed attempt
        Optional<TestAttempt> lastAttempt = attemptRepository
                .findTopByCandidateAndJobOrderByAttemptNumberDesc(candidate, job);

        if (lastAttempt.isPresent()) {
            TestAttempt last = lastAttempt.get();
            if (last.getStatus() == TestAttempt.AttemptStatus.IN_PROGRESS) {
                throw new RuntimeException(
                        "You have a test already in progress. Please submit it first.");
            }
            if (last.getNextAllowedAt() != null &&
                    LocalDateTime.now().isBefore(last.getNextAllowedAt())) {
                long daysLeft = ChronoUnit.DAYS.between(
                        LocalDateTime.now(), last.getNextAllowedAt()) + 1;
                throw new RuntimeException(
                        "You cannot attempt the test yet. " +
                                "Please wait " + daysLeft + " more day(s). " +
                                "Next attempt allowed on: " + last.getNextAllowedAt().toLocalDate());
            }
        }

        // 4. Calculate attempt number
        int attemptNumber = lastAttempt.map(a -> a.getAttemptNumber() + 1).orElse(1);

        // 5. Collect previous question topics to avoid repeats
        String previousTopics = collectPreviousTopics(candidate, job);

        // 6. Generate 20 AI questions
        log.info("Generating AI questions for candidate {} job {} attempt {}",
                candidateEmail, jobId, attemptNumber);

        List<AiService.GeneratedQuestion> generated = aiService.generateQuestions(
                job.getTitle(),
                job.getRequiredSkills(),
                previousTopics,
                attemptNumber
        );

        if (generated.isEmpty()) {
            throw new RuntimeException("Failed to generate test questions. Please try again.");
        }

        // 7. Save the attempt
        TestAttempt attempt = TestAttempt.builder()
                .candidate(candidate)
                .job(job)
                .attemptNumber(attemptNumber)
                .status(TestAttempt.AttemptStatus.IN_PROGRESS)
                .build();
        attempt = attemptRepository.save(attempt);

        // 8. Save all 20 questions (WITHOUT correct answers in the response)
        for (AiService.GeneratedQuestion gq : generated) {
            TestQuestion tq = TestQuestion.builder()
                    .attempt(attempt)
                    .questionNumber(gq.getQuestionNumber())
                    .question(gq.getQuestion())
                    .optionA(gq.getOptionA())
                    .optionB(gq.getOptionB())
                    .optionC(gq.getOptionC())
                    .optionD(gq.getOptionD())
                    .correctAnswer(gq.getCorrectAnswer()) // stored in DB, NOT sent to candidate
                    .build();
            questionRepository.save(tq);
        }

        // 9. Build response — questions WITHOUT correct answers
        List<TestDto.QuestionResponse> questionResponses = generated.stream()
                .map(gq -> TestDto.QuestionResponse.builder()
                        .questionNumber(gq.getQuestionNumber())
                        .question(gq.getQuestion())
                        .optionA(gq.getOptionA())
                        .optionB(gq.getOptionB())
                        .optionC(gq.getOptionC())
                        .optionD(gq.getOptionD())
                        .build()) // correctAnswer intentionally excluded
                .toList();

        return TestDto.StartTestResponse.builder()
                .attemptId(attempt.getId())
                .jobTitle(job.getTitle())
                .attemptNumber(attemptNumber)
                .totalQuestions(questionResponses.size())
                .questions(questionResponses)
                .message("Test started! You have 20 questions. Good luck!")
                .build();
    }

    // ── SUBMIT TEST ────────────────────────────────────────────
    @Transactional
    public TestDto.SubmitTestResponse submitTest(Long attemptId,
                                                 TestDto.SubmitTestRequest request,
                                                 String candidateEmail) {

        User candidate = findUserByEmail(candidateEmail);

        TestAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Test attempt not found."));

        // Security: make sure this is the candidate's own attempt
        if (!attempt.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("Unauthorised access to this test attempt.");
        }

        if (attempt.getStatus() != TestAttempt.AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("This test has already been submitted.");
        }

        // 1. Load all questions for this attempt
        List<TestQuestion> questions = questionRepository
                .findByAttemptOrderByQuestionNumber(attempt);

        // 2. Grade each answer
        Map<Integer, String> answers = request.getAnswers(); // questionNumber -> "A"/"B"/"C"/"D"
        int correctCount = 0;

        for (TestQuestion question : questions) {
            String candidateAnswer = answers.get(question.getQuestionNumber());
            boolean isCorrect = candidateAnswer != null &&
                    candidateAnswer.equalsIgnoreCase(question.getCorrectAnswer());

            question.setCandidateAnswer(candidateAnswer);
            question.setIsCorrect(isCorrect);
            questionRepository.save(question);

            if (isCorrect) correctCount++;
        }

        // 3. Calculate score as percentage
        int score = (int) Math.round((correctCount * 100.0) / questions.size());

        // 4. Apply cooldown rules and determine status
        TestAttempt.AttemptStatus status;
        LocalDateTime nextAllowedAt = null;
        String resultMessage;

        if (score >= 75) {
            status = TestAttempt.AttemptStatus.PASSED;
            resultMessage = "Congratulations! You passed with " + score +
                    "%. Your profile is now visible to the recruiter!";
            // Update application status to TEST_PASSED
            updateApplicationStatus(candidate, attempt.getJob(),
                    Application.ApplicationStatus.TEST_PASSED);

        } else if (score >= 50) {
            status = TestAttempt.AttemptStatus.FAILED;
            nextAllowedAt = LocalDateTime.now().plusDays(4);
            resultMessage = "You scored " + score + "%. You need 75% to pass. " +
                    "You can retry after 4 days on " +
                    nextAllowedAt.toLocalDate() + ".";

        } else if (score >= 30) {
            status = TestAttempt.AttemptStatus.FAILED;
            nextAllowedAt = LocalDateTime.now().plusDays(10);
            resultMessage = "You scored " + score + "%. You need 75% to pass. " +
                    "You can retry after 10 days on " +
                    nextAllowedAt.toLocalDate() + ".";

        } else {
            // score < 30
            status = TestAttempt.AttemptStatus.FAILED;
            nextAllowedAt = LocalDateTime.now().plusDays(30);
            resultMessage = "You scored " + score + "%. " +
                    "Please prepare more thoroughly. " +
                    "You can retry after 30 days on " +
                    nextAllowedAt.toLocalDate() + ".";
        }

        // Generate post-assessment AI feedback
        AiService.TestFeedback feedback = aiService.generateTestFeedback(questions, attempt.getJob().getTitle());
        attempt.setWeakTopics(feedback.getWeakTopics());
        attempt.setStrengths(feedback.getStrengths());
        attempt.setImprovementSuggestions(feedback.getImprovementSuggestions());

        // 5. Save attempt result
        attempt.setScore(score);
        attempt.setStatus(status);
        attempt.setNextAllowedAt(nextAllowedAt);
        TestAttempt savedAttempt = attemptRepository.save(attempt);

        return TestDto.SubmitTestResponse.builder()
                .attemptId(attemptId)
                .score(score)
                .correctAnswers(correctCount)
                .totalQuestions(questions.size())
                .status(status.name())
                .nextAllowedAt(nextAllowedAt)
                .message(resultMessage)
                .weakTopics(savedAttempt.getWeakTopics())
                .strengths(savedAttempt.getStrengths())
                .improvementSuggestions(savedAttempt.getImprovementSuggestions())
                .build();
    }

    // ── GET TEST STATUS ────────────────────────────────────────
    public TestDto.TestStatusResponse getTestStatus(Long jobId, String candidateEmail) {

        User candidate = findUserByEmail(candidateEmail);
        JobPosting job = findJobById(jobId);

        Optional<TestAttempt> lastAttempt = attemptRepository
                .findTopByCandidateAndJobOrderByAttemptNumberDesc(candidate, job);

        if (lastAttempt.isEmpty()) {
            return TestDto.TestStatusResponse.builder()
                    .canAttempt(true)
                    .attemptNumber(0)
                    .message("No previous attempts. You can start the test now!")
                    .build();
        }

        TestAttempt last = lastAttempt.get();

        if (last.getStatus() == TestAttempt.AttemptStatus.PASSED) {
            return TestDto.TestStatusResponse.builder()
                    .canAttempt(false)
                    .attemptNumber(last.getAttemptNumber())
                    .lastScore(last.getScore())
                    .message("You have already passed this test!")
                    .weakTopics(last.getWeakTopics())
                    .strengths(last.getStrengths())
                    .improvementSuggestions(last.getImprovementSuggestions())
                    .build();
        }

        if (last.getStatus() == TestAttempt.AttemptStatus.IN_PROGRESS) {
            return TestDto.TestStatusResponse.builder()
                    .canAttempt(true)
                    .attemptNumber(last.getAttemptNumber())
                    .message("You have a test in progress. Please submit it.")
                    .weakTopics(last.getWeakTopics())
                    .strengths(last.getStrengths())
                    .improvementSuggestions(last.getImprovementSuggestions())
                    .build();
        }

        // Check cooldown
        boolean canAttempt = last.getNextAllowedAt() == null ||
                LocalDateTime.now().isAfter(last.getNextAllowedAt());

        long daysLeft = canAttempt ? 0 :
                ChronoUnit.DAYS.between(LocalDateTime.now(), last.getNextAllowedAt()) + 1;

        String message = canAttempt
                ? "Cooldown over! You can attempt the test now."
                : "Please wait " + daysLeft + " more day(s). Next attempt: "
                + last.getNextAllowedAt().toLocalDate();

        return TestDto.TestStatusResponse.builder()
                .canAttempt(canAttempt)
                .attemptNumber(last.getAttemptNumber())
                .lastScore(last.getScore())
                .nextAllowedAt(last.getNextAllowedAt())
                .message(message)
                .weakTopics(last.getWeakTopics())
                .strengths(last.getStrengths())
                .improvementSuggestions(last.getImprovementSuggestions())
                .build();
    }

    // ── Helpers ────────────────────────────────────────────────

    private String collectPreviousTopics(User candidate, JobPosting job) {
        List<TestAttempt> previousAttempts = attemptRepository
                .findByCandidateAndJobOrderByAttemptNumberDesc(candidate, job);

        if (previousAttempts.isEmpty()) return "";

        // Collect first question from each previous attempt as topic hint
        StringBuilder topics = new StringBuilder();
        for (TestAttempt prev : previousAttempts) {
            List<TestQuestion> qs = questionRepository
                    .findByAttemptOrderByQuestionNumber(prev);
            if (!qs.isEmpty()) {
                topics.append(qs.get(0).getQuestion(), 0,
                                Math.min(80, qs.get(0).getQuestion().length()))
                        .append("; ");
            }
        }
        return topics.toString();
    }

    private void updateApplicationStatus(User candidate, JobPosting job,
                                         Application.ApplicationStatus status) {
        applicationRepository.findByCandidateAndJob(candidate, job)
                .ifPresent(app -> {
                    app.setStatus(status);
                    applicationRepository.save(app);
                });
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private JobPosting findJobById(Long id) {
        return jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }
}