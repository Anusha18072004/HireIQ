package com.hireiq.hireiq;

import com.hireiq.entity.*;
import com.hireiq.service.AiService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Slf4j
public class JobMatchComparisonTest {

    @Autowired
    private AiService aiService;

    // ── SCENARIO 1: PERFECT FIT ──────────────────────────────────────────
    @Test
    public void testPerfectFitScenario() {
        log.info("--- TEST SCENARIO 1: Perfect Fit Candidate ---");

        JobPosting job = JobPosting.builder()
                .title("Senior React & Node Engineer")
                .description("Looking for a Senior Software Engineer to build scalable web applications. Must be strong in React, Node.js, and Hybrid working mode in Bangalore.")
                .requiredSkills("React, Node.js, JavaScript, Express, HTML5")
                .preferredSkills("Docker, TypeScript, AWS")
                .experienceRequired("5-8 years")
                .educationRequirement("B.Tech")
                .minCgpa(7.5)
                .employmentType("Full Time")
                .workMode("Hybrid")
                .seniority("Senior")
                .noticePeriodPreference("Immediate")
                .aiWeightSkills(30)
                .aiWeightExperience(30)
                .aiWeightEducation(20)
                .aiWeightProjects(20)
                .knockoutQuestions("[{\"text\": \"Are you comfortable working in a Hybrid mode in Bangalore?\", \"expectedAnswer\": \"Yes\"}]")
                .build();

        CandidateProfile candidate = CandidateProfile.builder()
                .firstName("Anusha")
                .lastName("K")
                .summary("Senior Frontend & Full Stack Developer with 6 years of experience building modern React web apps.")
                .skills("React, Node.js, JavaScript, Express, HTML5, TypeScript, Docker, Git")
                .totalExperienceYears(6)
                .totalExperienceMonths(2)
                .noticePeriod("Immediate")
                .city("Bangalore")
                .preferredLocations("Bangalore")
                .preferredJobType("Full Time")
                .experiences(new ArrayList<>())
                .educations(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();

        candidate.getExperiences().add(WorkExperience.builder()
                .companyName("WebApps Corp")
                .jobTitle("Senior Software Engineer")
                .employmentType("Full Time")
                .startMonth("June")
                .startYear(2020)
                .isCurrentJob(true)
                .description("Led the migration of dashboard frontend to React and TypeScript. Managed Node.js backend services.")
                .skills("React, Node.js, TypeScript")
                .candidateProfile(candidate)
                .build());

        candidate.getEducations().add(Education.builder()
                .degree("B.Tech")
                .fieldOfStudy("Computer Science")
                .instituteName("PES University")
                .startYear(2016)
                .endYear(2020)
                .grade("8.2")
                .gradeType("CGPA")
                .candidateProfile(candidate)
                .build());

        candidate.getProjects().add(Project.builder()
                .projectTitle("Agile Project Management Tool")
                .projectDescription("Built a Trello clone using React, Node, and WebSockets for real-time ticket drag-and-drop updates.")
                .technologiesUsed("React, Node.js, WebSockets")
                .candidateProfile(candidate)
                .build());

        AiService.MatchResult result = aiService.calculateMatch(candidate, job);
        log.info("Perfect Fit Score: {}%, Pass Knockouts: {}, Reason: {}", 
                result.score(), result.knockoutPass(), result.reason());

        assertTrue(result.knockoutPass(), "Should pass the hybrid Bangalore knockout question");
        assertTrue(result.score() >= 80, "Perfect candidate score should be >= 80%");
        assertEquals("", result.failedKnockoutQuestion(), "No failed knockout question");
    }

    // ── SCENARIO 2: FAILED KNOCKOUT ──────────────────────────────────────
    @Test
    public void testFailedKnockoutScenario() {
        log.info("--- TEST SCENARIO 2: Candidate Fails Custom Knockout Question ---");

        JobPosting job = JobPosting.builder()
                .title("DevOps Engineer")
                .description("Manage deployment pipelines and AWS cloud infrastructure.")
                .requiredSkills("AWS, Terraform, Docker, CI/CD")
                .experienceRequired("3-5 years")
                .educationRequirement("B.Tech")
                .knockoutQuestions("[{\"text\": \"Do you have hands-on experience with Terraform for infrastructure as code?\", \"expectedAnswer\": \"Yes\"}]")
                .build();

        // Candidate has AWS and Docker experience, but NO Terraform experience in skills, experiences, or projects
        CandidateProfile candidate = CandidateProfile.builder()
                .firstName("Bob")
                .lastName("Smith")
                .summary("System administrator with 4 years of experience working with Linux and AWS cloud deployments.")
                .skills("AWS, Docker, Linux, Bash, Jenkins")
                .totalExperienceYears(4)
                .experiences(new ArrayList<>())
                .educations(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();

        candidate.getEducations().add(Education.builder()
                .degree("B.Tech")
                .fieldOfStudy("Information Technology")
                .instituteName("SIT")
                .grade("7.8")
                .gradeType("CGPA")
                .candidateProfile(candidate)
                .build());

        AiService.MatchResult result = aiService.calculateMatch(candidate, job);
        log.info("Failed Knockout Score: {}%, Pass Knockouts: {}, Failed Question: '{}', Reason: {}", 
                result.score(), result.knockoutPass(), result.failedKnockoutQuestion(), result.reason());

        assertFalse(result.knockoutPass(), "Candidate should fail the Terraform knockout question");
        assertEquals(0, result.score(), "Match score must be 0 on knockout failure");
        assertNotNull(result.failedKnockoutQuestion());
        assertTrue(result.failedKnockoutQuestion().toLowerCase().contains("terraform"));
    }

    // ── SCENARIO 3: SENIORITY AND EXPERIENCE MISMATCH ────────────────────
    @Test
    public void testSeniorityAndExperienceMismatch() {
        log.info("--- TEST SCENARIO 3: Experience Mismatch (Junior applying for Lead) ---");

        JobPosting job = JobPosting.builder()
                .title("Lead Backend Architect")
                .description("We need an architect with 10+ years of experience directing database architecture and large-scale Java distributions.")
                .requiredSkills("Java, Spring Boot, Microservices, System Design, SQL Tuning")
                .experienceRequired("10+ years")
                .seniority("Lead")
                .educationRequirement("Any Degree")
                .build();

        // Candidate has only 1 year experience (Junior)
        CandidateProfile candidate = CandidateProfile.builder()
                .firstName("Charlie")
                .lastName("Brown")
                .summary("Junior Backend Developer eager to learn Spring Boot microservices.")
                .skills("Java, Spring Boot, SQL")
                .totalExperienceYears(1)
                .totalExperienceMonths(0)
                .experiences(new ArrayList<>())
                .educations(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();

        candidate.getExperiences().add(WorkExperience.builder()
                .companyName("Startup Corp")
                .jobTitle("Junior Java Developer")
                .startYear(2025)
                .isCurrentJob(true)
                .description("Supported senior engineers in fixing bugs in REST controllers.")
                .skills("Java")
                .candidateProfile(candidate)
                .build());

        AiService.MatchResult result = aiService.calculateMatch(candidate, job);
        log.info("Experience Mismatch Score: {}%, Experience Subscore: {}, Reason: {}", 
                result.score(), result.experienceScore(), result.reason());

        assertTrue(result.knockoutPass(), "Should pass knockout as there are none");
        assertTrue(result.score() < 50, "Overall score should be low due to seniority and experience gap");
        assertTrue(result.experienceScore() < 40, "Experience subscore should be heavily penalised");
    }

    // ── SCENARIO 4: PREFERRED COLLEGES ADVANTAGE ─────────────────────────
    @Test
    public void testPreferredCollegesAdvantage() {
        log.info("--- TEST SCENARIO 4: Preferred College Check ---");

        JobPosting job = JobPosting.builder()
                .title("Data Scientist")
                .description("Data Scientist role. Looking for top engineering college candidates.")
                .requiredSkills("Python, PyTorch, SQL, Statistics")
                .experienceRequired("2-4 years")
                .preferredColleges("IIT Bombay, IIT Madras, IIT Delhi, BITS Pilani")
                .build();

        // Candidate A is from a preferred college (IIT Bombay)
        CandidateProfile candidateA = CandidateProfile.builder()
                .firstName("Alice")
                .lastName("Preferred")
                .skills("Python, PyTorch, SQL")
                .totalExperienceYears(3)
                .educations(new ArrayList<>())
                .experiences(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();
        candidateA.getEducations().add(Education.builder()
                .degree("B.Tech")
                .fieldOfStudy("Computer Science")
                .instituteName("IIT Bombay")
                .grade("8.5")
                .gradeType("CGPA")
                .candidateProfile(candidateA)
                .build());

        // Candidate B is from a local college (XYZ institute)
        CandidateProfile candidateB = CandidateProfile.builder()
                .firstName("Bob")
                .lastName("Local")
                .skills("Python, PyTorch, SQL")
                .totalExperienceYears(3)
                .educations(new ArrayList<>())
                .experiences(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();
        candidateB.getEducations().add(Education.builder()
                .degree("B.Tech")
                .fieldOfStudy("Computer Science")
                .instituteName("XYZ institute of Technology")
                .grade("8.5")
                .gradeType("CGPA")
                .candidateProfile(candidateB)
                .build());

        AiService.MatchResult resultA = aiService.calculateMatch(candidateA, job);
        AiService.MatchResult resultB = aiService.calculateMatch(candidateB, job);

        log.info("IIT Bombay Candidate Education Score: {}, Overall Score: {}", resultA.educationScore(), resultA.score());
        log.info("Local College Candidate Education Score: {}, Overall Score: {}", resultB.educationScore(), resultB.score());

        assertTrue(resultA.educationScore() >= resultB.educationScore(), 
                "IIT Bombay candidate should have an equal or higher education score than a candidate from a non-preferred college");
    }

    // ── SCENARIO 5: NOTICE PERIOD IMPACT ──────────────────────────────────
    @Test
    public void testNoticePeriodImpact() {
        log.info("--- TEST SCENARIO 5: Notice Period Impact ---");

        JobPosting job = JobPosting.builder()
                .title("Critical Dev Ops Architect")
                .description("Urgent hire needed immediately due to database overhaul.")
                .requiredSkills("Kubernetes, Jenkins, AWS")
                .experienceRequired("5 years")
                .noticePeriodPreference("Immediate")
                .build();

        CandidateProfile candidate = CandidateProfile.builder()
                .firstName("Dev")
                .lastName("Op")
                .skills("Kubernetes, Jenkins, AWS")
                .totalExperienceYears(5)
                .noticePeriod("90 Days") // Long notice period
                .experiences(new ArrayList<>())
                .educations(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();

        AiService.MatchResult result = aiService.calculateMatch(candidate, job);
        log.info("90-Day Notice Period Candidate Score: {}%, Reason: {}", result.score(), result.reason());

        // Standard check: the candidate score remains reasonable but is penalised relative to immediate joiners
        assertTrue(result.score() < 95, "Notice period mismatch should prevent a perfect score");
    }

    // ── DATABASE END-TO-END FLOW ──────────────────────────────────────────
    @Autowired
    private com.hireiq.service.ApplicationService applicationService;

    @Autowired
    private com.hireiq.repository.ApplicationRepository applicationRepository;

    @Autowired
    private com.hireiq.repository.UserRepository userRepository;

    @Autowired
    private com.hireiq.repository.JobPostingRepository jobPostingRepository;

    @Test
    @org.springframework.transaction.annotation.Transactional
    public void testActualDatabaseApplyFlow() {
        log.info("Starting actual database apply flow test...");
        
        User user = userRepository.findByEmail("testcandidate@gmail.com").orElse(null);
        JobPosting job = jobPostingRepository.findById(1L).orElse(null);

        if (user != null && job != null) {
            applicationRepository.findByCandidateAndJob(user, job).ifPresent(app -> {
                log.info("Deleting existing test application ID: {}", app.getId());
                applicationRepository.delete(app);
                applicationRepository.flush();
            });
            
            log.info("Executing application service apply for candidate: {} on job ID: 1", user.getEmail());
            com.hireiq.dto.ApplicationDto.ApplicationResponse response = applicationService.apply(1L, user.getEmail());
            
            log.info("--- Application Service Result ---");
            log.info("Match Score: {}%", response.getMatchScore());
            log.info("Status:      {}", response.getStatus());
            log.info("Reason:      {}", response.getMatchReason());
            log.info("----------------------------------");
            
            assertNotNull(response.getMatchScore());
            assertTrue(response.getMatchScore() >= 75, "Candidate should score high and be shortlisted");
            assertEquals("SHORTLISTED", response.getStatus());
        } else {
            log.warn("Test candidate or Job ID 1 not found in database. Skipping database apply test.");
        }
    }
}
