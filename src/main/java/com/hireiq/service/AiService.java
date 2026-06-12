package com.hireiq.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireiq.entity.TestQuestion;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * AiService — the brain of HireIQ.
 *
 * Three AI features:
 *   1. parseResume()       - extract structured data from raw resume text
 *   2. calculateMatch()    - score resume vs job description (0-100)
 *   3. generateQuestions() - create 20 unique MCQs for the test
 *
 * Uses Groq LLaMA 3.3 70B via Spring AI (OpenAI-compatible API).
 */
@Service
@Slf4j
public class AiService {

    private final ChatClient chatClient;
    private final org.springframework.ai.embedding.EmbeddingModel embeddingModel;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            .configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true);

    // Spring AI M6 - inject builder, build once
    public AiService(ChatClient.Builder builder, org.springframework.ai.embedding.EmbeddingModel embeddingModel) {
        this.chatClient = builder.build();
        this.embeddingModel = embeddingModel;
    }

    // ── 1. RESUME PARSER ───────────────────────────────────────
    public ParsedResume parseResume(String rawResumeText) {
        String prompt = """
                You are an expert resume parser with 10 years of experience.
                Extract ALL information from the resume text below.
                Return ONLY a valid JSON object. No explanation. No markdown. Raw JSON only.

                Return this EXACT JSON structure:

                {
                  "fullName": "full name or empty string",
                  "email": "email or empty string", 
                  "phone": "phone number or empty string",
                  "city": "city name or empty string",
                  "state": "state name or empty string",
                  "currentRole": "most recent job title or empty string",
                  "totalYearsExperience": 0,
                  "summary": "professional summary from resume or empty string",
                  "skills": ["skill1", "skill2", "skill3"],
                  
                  "workExperiences": [
                    {
                      "companyName": "company name",
                      "jobTitle": "job title / designation",
                      "employmentType": "Full Time or Internship or Part Time or Freelance",
                      "startMonth": "January",
                      "startYear": 2022,
                      "endMonth": "December",
                      "endYear": 2023,
                      "isCurrentJob": false,
                      "description": "key responsibilities and achievements",
                      "location": "city or remote",
                      "skillsUsed": ["Java", "Spring Boot"]
                    }
                  ],
                  
                  "educations": [
                    {
                      "degree": "B.Tech or MCA or MBA or 12th or 10th etc",
                      "fieldOfStudy": "Computer Science or Information Technology etc",
                      "instituteName": "college or school name",
                      "boardOrUniversity": "university or board name",
                      "startYear": 2019,
                      "endYear": 2023,
                      "grade": "8.5",
                      "gradeType": "CGPA or Percentage",
                      "isCurrentlyStudying": false
                    }
                  ],
                  
                  "projects": [
                    {
                      "projectTitle": "project name",
                      "projectDescription": "what the project does and what you built",
                      "technologiesUsed": ["Java", "Spring Boot", "React"],
                      "projectUrl": "live url or empty string",
                      "githubUrl": "github link or empty string",
                      "startMonth": "January",
                      "startYear": 2023,
                      "endMonth": "March", 
                      "endYear": 2023,
                      "isOngoing": false
                    }
                  ],
                  
                  "certifications": [
                    {
                      "certificationName": "certificate name",
                      "issuingOrganization": "issuing org name",
                      "issueMonth": "January",
                      "issueYear": 2023,
                      "expiryYear": 2025,
                      "doesNotExpire": false,
                      "credentialId": "credential id or empty",
                      "credentialUrl": "verify url or empty"
                    }
                  ],
                  
                  "languages": [
                    {
                      "languageName": "English",
                      "proficiency": "Proficient"
                    }
                  ]
                }

                IMPORTANT EXTRACTION RULES:
                1. workExperiences: Look for sections like "Experience", "Work History", 
                   "Employment", "Internship". Extract EVERY job listed, even internships.
                   If dates show "Present" or "Current" set isCurrentJob: true and endYear: 0
                   
                2. educations: Look for "Education", "Academic", "Qualification".
                   Extract ALL degrees — B.Tech, 12th, 10th, diploma, MBA etc.
                   Guess gradeType from context (CGPA usually below 10, Percentage above 10)
                   
                3. projects: Look for "Projects", "Academic Projects", "Personal Projects",
                   "Portfolio". Extract ALL projects mentioned anywhere in the resume.
                   Even if project is mentioned briefly, extract what you can.
                   
                4. certifications: Look for "Certifications", "Certificates", "Courses",
                   "Training", "Achievements", "Licenses". Extract ALL certifications.
                   Online courses from Udemy, Coursera, Google also count.
                   
                5. skills: Extract ALL technical skills, tools, technologies, frameworks
                   mentioned anywhere in the resume including in experience and projects.
                   
                6. If a field is not found, use empty string "" for strings, 
                   empty array [] for arrays, 0 for numbers, false for booleans.
                   
                7. NEVER return null. Always return the complete JSON structure.
                8. For months, always use full month name like "January" not "Jan"

                Resume text:
                """ + rawResumeText;

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            String cleaned = cleanJson(response);
            return objectMapper.readValue(cleaned, ParsedResume.class);

        } catch (Exception e) {
            log.error("Resume parsing failed: {}", e.getMessage());
            return new ParsedResume();
        }
    }

    // ── 2. MATCH SCORER ────────────────────────────────────────
    public MatchResult calculateMatch(String resumeSummary,
                                      String candidateSkills,
                                      String jobTitle,
                                      String jobDescription,
                                      String requiredSkills) {
        String prompt = String.format("""
                You are a professional recruitment AI.
                Compare the candidate profile against the job requirements.
                Return ONLY a JSON object with no explanation or markdown.

                JSON format:
                {
                  "matchScore": 85,
                  "reason": "brief one-sentence reason for the score"
                }

                Rules:
                - matchScore must be an integer between 0 and 100
                - Score based on: skill match (50%%), experience relevance (30%%), overall fit (20%%)
                - If candidate has 75%% or more of required skills, score should be >= 75

                Job Title: %s
                Required Skills: %s
                Job Description: %s

                Candidate Skills: %s
                Candidate Summary: %s
                """, jobTitle, requiredSkills, jobDescription, candidateSkills, resumeSummary);

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            String cleaned = cleanJson(response);
            JsonNode node = objectMapper.readTree(cleaned);

            return new MatchResult(
                    node.path("matchScore").asInt(0),
                    text(node, "reason")
            );

        } catch (Exception e) {
            log.error("Match scoring failed: {}", e.getMessage());
            return new MatchResult(0, "Match scoring failed. Please try again.");
        }
    }

    public MatchResult calculateMatch(com.hireiq.entity.CandidateProfile profile,
                                      com.hireiq.entity.JobPosting job) {
        String formattedCandidate = formatCandidateProfile(profile);
        String formattedJob = formatJobPosting(job);

        String prompt = String.format("""
                You are a professional recruitment AI matching engine.
                Compare the candidate profile details against the job posting details and requirements.
                Evaluate and score each section, verify if any knockout questions are violated, and calculate the overall match score.
                Return ONLY a JSON object with no explanation or markdown code block wrapper.

                Return this EXACT JSON format:
                {
                  "matchScore": 85,
                  "reason": "Provide a structured explanation. If a knockout question fails, clearly state which knockout question failed.",
                  "knockoutPass": true,
                  "failedKnockoutQuestion": "failed question text or empty string",
                  "skillsScore": 90,
                  "experienceScore": 80,
                  "educationScore": 85,
                  "projectsScore": 75
                }

                Rules:
                1. KNOCKOUT QUESTIONS: If the Job has knockout questions listed (JSON format or text), evaluate them carefully against the candidate's actual qualifications in the profile.
                   - A knockout question specifies criteria that are mandatory.
                   - If the candidate clearly fails ANY knockout question, you MUST set "knockoutPass" to false, "failedKnockoutQuestion" to the text of the failed question, and "matchScore" to 0.
                   - If there are no knockout questions, or the candidate passes all of them, set "knockoutPass" to true and "failedKnockoutQuestion" to "".
                
                2. SCORING WEIGHTS:
                   - Look at the "AI Matching Weights" from the job posting.
                   - If weights are defined (e.g., aiWeightSkills, aiWeightExperience, aiWeightEducation, aiWeightProjects), calculate the overall "matchScore" using these weights:
                     matchScore = (skillsScore * aiWeightSkills + experienceScore * aiWeightExperience + educationScore * aiWeightEducation + projectsScore * aiWeightProjects) / 100.
                   - If weights are not defined, are null, or sum to 0, use the default weights:
                     Skills (40%%), Experience (30%%), Education (15%%), Projects (15%%).
                     matchScore = (skillsScore * 40 + experienceScore * 30 + educationScore * 15 + projectsScore * 15) / 100.
                   - Round the final matchScore to the nearest integer (between 0 and 100).
                
                3. SUB-SCORING CRITERIA (0 to 100 each):
                   - skillsScore: How well do the candidate's skills match the required and preferred skills?
                   - experienceScore: How relevant is the candidate's job history, titles, responsibilities, and total years of experience to the job's experience requirements and seniority?
                   - educationScore: Does the candidate meet the degree level (B.Tech, MCA, MBA, etc.), minimum CGPA, and preferred college preferences?
                   - projectsScore: Are the candidate's projects relevant to the technologies and domain of the job?

                Job Profile Requirements:
                %s

                Candidate Profile Details:
                %s
                """, formattedJob, formattedCandidate);

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            String cleaned = cleanJson(response);
            JsonNode node = objectMapper.readTree(cleaned);

            return new MatchResult(
                    node.path("matchScore").asInt(0),
                    text(node, "reason"),
                    node.path("knockoutPass").asBoolean(true),
                    text(node, "failedKnockoutQuestion"),
                    node.path("skillsScore").asInt(0),
                    node.path("experienceScore").asInt(0),
                    node.path("educationScore").asInt(0),
                    node.path("projectsScore").asInt(0)
            );

        } catch (Exception e) {
            log.error("Advanced Match scoring failed: {}", e.getMessage());
            return new MatchResult(0, "Match scoring failed due to internal error.", true, "", 0, 0, 0, 0);
        }
    }

    private String formatCandidateProfile(com.hireiq.entity.CandidateProfile profile) {
        if (profile == null) return "No profile data available.";
        StringBuilder sb = new StringBuilder();
        sb.append("Name: ").append(profile.getFirstName() != null ? profile.getFirstName() : "").append(" ")
          .append(profile.getLastName() != null ? profile.getLastName() : "").append("\n");
        sb.append("Current Role/Title: ").append(profile.getCurrentRole() != null ? profile.getCurrentRole() : "").append("\n");
        sb.append("Summary: ").append(profile.getSummary() != null ? profile.getSummary() : "").append("\n");
        sb.append("Skills: ").append(profile.getSkills() != null ? profile.getSkills() : "").append("\n");
        sb.append("Total Experience: ")
          .append(profile.getTotalExperienceYears() != null ? profile.getTotalExperienceYears() : 0).append(" years, ")
          .append(profile.getTotalExperienceMonths() != null ? profile.getTotalExperienceMonths() : 0).append(" months\n");
        sb.append("Notice Period: ").append(profile.getNoticePeriod() != null ? profile.getNoticePeriod() : "").append("\n");
        sb.append("Preferred Locations: ").append(profile.getPreferredLocations() != null ? profile.getPreferredLocations() : "").append("\n");
        sb.append("Preferred Job Type: ").append(profile.getPreferredJobType() != null ? profile.getPreferredJobType() : "").append("\n");
        sb.append("Expected Salary: ").append(profile.getExpectedSalary() != null ? profile.getExpectedSalary() : "").append("\n");

        sb.append("\nWork Experiences:\n");
        if (profile.getExperiences() != null && !profile.getExperiences().isEmpty()) {
            for (com.hireiq.entity.WorkExperience exp : profile.getExperiences()) {
                sb.append("- Title: ").append(exp.getJobTitle())
                  .append(" at ").append(exp.getCompanyName())
                  .append(" (").append(exp.getEmploymentType() != null ? exp.getEmploymentType() : "Full Time").append(")\n")
                  .append("  Duration: ").append(exp.getStartMonth()).append(" ").append(exp.getStartYear())
                  .append(" to ").append(Boolean.TRUE.equals(exp.getIsCurrentJob()) ? "Present" : exp.getEndMonth() + " " + exp.getEndYear()).append("\n")
                  .append("  Description: ").append(exp.getDescription() != null ? exp.getDescription() : "").append("\n")
                  .append("  Skills Used: ").append(exp.getSkills() != null ? exp.getSkills() : "").append("\n");
            }
        } else {
            sb.append("None listed.\n");
        }

        sb.append("\nEducations:\n");
        if (profile.getEducations() != null && !profile.getEducations().isEmpty()) {
            for (com.hireiq.entity.Education edu : profile.getEducations()) {
                sb.append("- ").append(edu.getDegree()).append(" in ").append(edu.getFieldOfStudy() != null ? edu.getFieldOfStudy() : "")
                  .append(" from ").append(edu.getInstituteName() != null ? edu.getInstituteName() : "")
                  .append(" (").append(edu.getBoardOrUniversity() != null ? edu.getBoardOrUniversity() : "").append(")\n")
                  .append("  Duration: ").append(edu.getStartYear()).append(" - ").append(edu.getEndYear()).append("\n")
                  .append("  Grade: ").append(edu.getGrade() != null ? edu.getGrade() : "").append(" (").append(edu.getGradeType() != null ? edu.getGradeType() : "").append(")\n");
            }
        } else {
            sb.append("None listed.\n");
        }

        sb.append("\nProjects:\n");
        if (profile.getProjects() != null && !profile.getProjects().isEmpty()) {
            for (com.hireiq.entity.Project proj : profile.getProjects()) {
                sb.append("- Title: ").append(proj.getProjectTitle()).append("\n")
                  .append("  Description: ").append(proj.getProjectDescription() != null ? proj.getProjectDescription() : "").append("\n")
                  .append("  Technologies: ").append(proj.getTechnologiesUsed() != null ? proj.getTechnologiesUsed() : "").append("\n");
            }
        } else {
            sb.append("None listed.\n");
        }

        sb.append("\nCertifications:\n");
        if (profile.getCertifications() != null && !profile.getCertifications().isEmpty()) {
            for (com.hireiq.entity.Certification cert : profile.getCertifications()) {
                sb.append("- ").append(cert.getCertificationName()).append(" issued by ").append(cert.getIssuingOrganization() != null ? cert.getIssuingOrganization() : "").append("\n");
            }
        } else {
            sb.append("None listed.\n");
        }

        sb.append("\nLanguages:\n");
        if (profile.getLanguages() != null && !profile.getLanguages().isEmpty()) {
            for (com.hireiq.entity.Language lang : profile.getLanguages()) {
                sb.append("- ").append(lang.getLanguageName()).append(" (").append(lang.getProficiency() != null ? lang.getProficiency() : "").append(")\n");
            }
        } else {
            sb.append("None listed.\n");
        }

        return sb.toString();
    }

    private String formatJobPosting(com.hireiq.entity.JobPosting job) {
        if (job == null) return "No job details available.";
        StringBuilder sb = new StringBuilder();
        sb.append("Job Title: ").append(job.getTitle()).append("\n");
        sb.append("Department: ").append(job.getDepartment() != null ? job.getDepartment() : "").append("\n");
        sb.append("Seniority: ").append(job.getSeniority() != null ? job.getSeniority() : "").append("\n");
        sb.append("Description: ").append(job.getDescription() != null ? job.getDescription() : "").append("\n");
        sb.append("Required Skills: ").append(job.getRequiredSkills() != null ? job.getRequiredSkills() : "").append("\n");
        sb.append("Preferred Skills: ").append(job.getPreferredSkills() != null ? job.getPreferredSkills() : "").append("\n");
        sb.append("Experience Required: ").append(job.getExperienceRequired() != null ? job.getExperienceRequired() : "").append("\n");
        sb.append("Education Required: ").append(job.getEducationRequirement() != null ? job.getEducationRequirement() : "").append("\n");
        sb.append("Minimum CGPA: ").append(job.getMinCgpa() != null ? job.getMinCgpa() : "No minimum").append("\n");
        sb.append("Preferred Colleges: ").append(job.getPreferredColleges() != null ? job.getPreferredColleges() : "None").append("\n");
        sb.append("Work Mode: ").append(job.getWorkMode() != null ? job.getWorkMode() : "").append("\n");
        sb.append("Employment Type: ").append(job.getEmploymentType() != null ? job.getEmploymentType() : "").append("\n");
        sb.append("Notice Period Preference: ").append(job.getNoticePeriodPreference() != null ? job.getNoticePeriodPreference() : "").append("\n");
        
        sb.append("\nAI Matching Weights:\n");
        sb.append("- Skills Weight: ").append(job.getAiWeightSkills() != null ? job.getAiWeightSkills() : "default").append("\n");
        sb.append("- Experience Weight: ").append(job.getAiWeightExperience() != null ? job.getAiWeightExperience() : "default").append("\n");
        sb.append("- Education Weight: ").append(job.getAiWeightEducation() != null ? job.getAiWeightEducation() : "default").append("\n");
        sb.append("- Projects Weight: ").append(job.getAiWeightProjects() != null ? job.getAiWeightProjects() : "default").append("\n");
        
        sb.append("\nKnockout Questions:\n");
        sb.append(job.getKnockoutQuestions() != null ? job.getKnockoutQuestions() : "None").append("\n");
        return sb.toString();
    }

    // ── 3. TEST QUESTION GENERATOR ─────────────────────────────
    public List<GeneratedQuestion> generateQuestions(String jobTitle,
                                                     String requiredSkills,
                                                     String previousTopics,
                                                     int attemptNumber) {
        String avoidNote = previousTopics.isBlank() ? "" :
                "Do NOT repeat these topics from previous attempts: " + previousTopics + "\n";

        String prompt = String.format("""
                You are a technical interviewer creating a recruitment assessment.
                Generate exactly 20 multiple choice questions for the role below.
                Return ONLY a JSON array. No explanation, no markdown, just raw JSON.

                Difficulty: MEDIUM - test fundamental understanding, not trivia.
                Each question must have exactly one correct answer.

                %s
                JSON format (array of 20 objects):
                [
                  {
                    "question": "What is the question text?",
                    "optionA": "First option",
                    "optionB": "Second option",
                    "optionC": "Third option",
                    "optionD": "Fourth option",
                    "correctAnswer": "A"
                  }
                ]

                correctAnswer must be exactly "A", "B", "C", or "D".

                Job Role: %s
                Required Skills: %s
                Attempt number: %d
                """, avoidNote, jobTitle, requiredSkills, attemptNumber);

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            String cleaned = cleanJson(response);
            JsonNode array = objectMapper.readTree(cleaned);

            List<GeneratedQuestion> questions = new ArrayList<>();
            for (int i = 0; i < array.size(); i++) {
                JsonNode q = array.get(i);
                questions.add(GeneratedQuestion.builder()
                        .questionNumber(i + 1)
                        .question(text(q, "question"))
                        .optionA(text(q, "optionA"))
                        .optionB(text(q, "optionB"))
                        .optionC(text(q, "optionC"))
                        .optionD(text(q, "optionD"))
                        .correctAnswer(text(q, "correctAnswer").toUpperCase())
                        .build());
            }
            return questions;

        } catch (Exception e) {
            log.error("Question generation failed: {}", e.getMessage());
            return List.of();
        }
    }

    // ── 4. PROFILE SUGGESTIONS GENERATOR ───────────────────────
    public com.hireiq.dto.SuggestionDto.ProfileSuggestions generateProfileSuggestions(
            String rawResumeText, String currentSkills, String currentRole, int yearsOfExperience) {
        String prompt = String.format("""
                You are an expert AI Career Coach.
                Analyze the candidate's resume and details below to provide highly strategic, professional, and actionable career advice.
                Return ONLY a JSON object with no explanation, markdown code blocks, or extra text. Just raw JSON.

                Return this exact JSON structure:
                {
                  "resumeFeedback": "Provide detailed feedback on the resume format, layout, impact of descriptions, use of action verbs, and structural improvements in rich Markdown format with clear bullet points.",
                  "skillGaps": "Identify exact technical/soft skills missing for their current or targeted next role based on industry standards. Format the text exactly as follows:\n### Missing Skills:\n- Skill A\n- Skill B\n- Skill C\n\n### Learning Suggestions:\n- Specific learning task/suggestion A\n- Specific learning task/suggestion B\n- Specific learning task/suggestion C",
                  "careerPaths": "Recommend 2-3 strategic short-term and long-term career growth paths, next roles to target, and industries where they would thrive, presented in a structured Markdown format."
                }

                Candidate Current Role: %s
                Candidate Skills: %s
                Candidate Experience: %d years
                Resume Content:
                %s
                """, currentRole, currentSkills, yearsOfExperience, rawResumeText);

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            String cleaned = cleanJson(response);
            JsonNode node = objectMapper.readTree(cleaned);

            return com.hireiq.dto.SuggestionDto.ProfileSuggestions.builder()
                    .resumeFeedback(text(node, "resumeFeedback"))
                    .skillGaps(text(node, "skillGaps"))
                    .careerPaths(text(node, "careerPaths"))
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate profile suggestions: {}", e.getMessage());
            return com.hireiq.dto.SuggestionDto.ProfileSuggestions.builder()
                    .resumeFeedback("Resume analysis failed. Please try again.")
                    .skillGaps("Skill gap analysis failed. Please try again.")
                    .careerPaths("Career path suggestion failed. Please try again.")
                    .build();
        }
    }

    // ── 5. MATCH SUGGESTIONS GENERATOR ─────────────────────────
    public com.hireiq.dto.SuggestionDto.MatchSuggestions generateMatchSuggestions(
            String resumeSummary, String candidateSkills, String jobTitle, String jobDescription, String requiredSkills) {
        String prompt = String.format("""
                You are an expert AI Career Coach.
                Compare the candidate's profile against the specific job posting details below to generate personalized preparation advice.
                Return ONLY a JSON object with no explanation, markdown code blocks, or extra text. Just raw JSON.

                Return this exact JSON structure:
                {
                  "tailoringSuggestions": "Provide specific, actionable instructions on how the candidate can customize their resume/profile description to match this exact job's requirements (e.g. key accomplishments to highlight, terms to include) in rich Markdown format.",
                  "interviewTips": "Generate 3 expected technical and 2 behavioral interview questions customized for this job and this candidate, along with smart answer hints, in rich Markdown format.",
                  "upskillingRoadmap": "Design a step-by-step upskilling roadmap/learning path to master any missing skills or technologies required for this specific job, in rich Markdown format.",
                  "honestReview": "Provide an extremely honest, critical, and objective review/evaluation of the candidate's alignment with this role. Explain clearly why they match or why they were rejected (focusing on specific missing experiences or qualifications). Conclude with a direct, honest suggestion/recommendation on whether they should apply or not (or if they should look for a different job profile), providing detailed reasons, in rich Markdown format."
                }

                Job Title: %s
                Required Skills: %s
                Job Description: %s

                Candidate Skills: %s
                Candidate Summary: %s
                """, jobTitle, requiredSkills, jobDescription, candidateSkills, resumeSummary);

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            String cleaned = cleanJson(response);
            JsonNode node = objectMapper.readTree(cleaned);

            return com.hireiq.dto.SuggestionDto.MatchSuggestions.builder()
                    .tailoringSuggestions(text(node, "tailoringSuggestions"))
                    .interviewTips(text(node, "interviewTips"))
                    .upskillingRoadmap(text(node, "upskillingRoadmap"))
                    .honestReview(text(node, "honestReview"))
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate match suggestions: {}", e.getMessage());
            return com.hireiq.dto.SuggestionDto.MatchSuggestions.builder()
                    .tailoringSuggestions("Failed to generate tailoring advice.")
                    .interviewTips("Failed to generate interview tips.")
                    .upskillingRoadmap("Failed to generate upskilling roadmap.")
                    .honestReview("Failed to generate honest review.")
                    .build();
        }
    }

    public com.hireiq.dto.SuggestionDto.MatchSuggestions generateMatchSuggestions(
            com.hireiq.entity.CandidateProfile profile,
            com.hireiq.entity.JobPosting job) {
        String formattedCandidate = formatCandidateProfile(profile);
        String formattedJob = formatJobPosting(job);

        String prompt = String.format("""
                You are an expert AI Career Coach.
                Compare the candidate's profile against the specific job posting details below to generate personalized preparation advice.
                Return ONLY a JSON object with no explanation, markdown code blocks, or extra text. Just raw JSON.

                Return this exact JSON structure:
                {
                  "tailoringSuggestions": "Provide specific, actionable instructions on how the candidate can customize their resume/profile description to match this exact job's requirements (e.g. key accomplishments to highlight, terms to include) in rich Markdown format.",
                  "interviewTips": "Generate 3 expected technical and 2 behavioral interview questions customized for this job and this candidate, along with smart answer hints, in rich Markdown format.",
                  "upskillingRoadmap": "Design a step-by-step upskilling roadmap/learning path to master any missing skills or technologies required for this specific job, in rich Markdown format.",
                  "honestReview": "Provide an extremely honest, critical, and objective review/evaluation of the candidate's alignment with this role. Explain clearly why they match or why they were rejected (focusing on specific missing experiences, qualifications, or failed knockout questions). Conclude with a direct, honest suggestion/recommendation on whether they should apply or not (or if they should look for a different job profile), providing detailed reasons, in rich Markdown format."
                }

                Job posting details:
                %s

                Candidate profile details:
                %s
                """, formattedJob, formattedCandidate);

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            String cleaned = cleanJson(response);
            JsonNode node = objectMapper.readTree(cleaned);

            return com.hireiq.dto.SuggestionDto.MatchSuggestions.builder()
                    .tailoringSuggestions(text(node, "tailoringSuggestions"))
                    .interviewTips(text(node, "interviewTips"))
                    .upskillingRoadmap(text(node, "upskillingRoadmap"))
                    .honestReview(text(node, "honestReview"))
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate advanced match suggestions: {}", e.getMessage());
            return com.hireiq.dto.SuggestionDto.MatchSuggestions.builder()
                    .tailoringSuggestions("Failed to generate tailoring advice.")
                    .interviewTips("Failed to generate interview tips.")
                    .upskillingRoadmap("Failed to generate upskilling roadmap.")
                    .honestReview("Failed to generate honest review.")
                    .build();
        }
    }

    // ── 6. TEST FEEDBACK GENERATOR ────────────────────────────
    public TestFeedback generateTestFeedback(List<com.hireiq.entity.TestQuestion> questions, String jobTitle) {
        StringBuilder questionsList = new StringBuilder();
        for (TestQuestion q : questions) {
            questionsList.append(String.format("Question: %s\nCorrect Answer: %s\nCandidate Answer: %s\nResult: %s\n\n",
                    q.getQuestion(),
                    q.getCorrectAnswer(),
                    q.getCandidateAnswer() == null ? "None" : q.getCandidateAnswer(),
                    q.getIsCorrect() ? "CORRECT" : "INCORRECT"
            ));
        }

        String prompt = String.format("""
                You are an expert technical interviewer and AI Career Coach.
                Analyze the candidate's graded multiple choice test questions for the role below and provide personalized post-assessment coaching feedback.
                Return ONLY a JSON object with no explanation, markdown code blocks, or extra text. Just raw JSON.

                Return this exact JSON structure:
                {
                  "weakTopics": "Identify specific concepts, skills, or topics where the candidate answered incorrectly or demonstrated weakness. Present as a list in rich Markdown format.",
                  "strengths": "Highlight specific topics or conceptual areas where the candidate answered correctly and showed excellent understanding. Present in rich Markdown format.",
                  "improvementSuggestions": "Provide actionable advice, study guides, or conceptual tips to help them bridge their weak areas and pass the test on their next attempt. Present in rich Markdown format."
                }

                Job Title: %s
                Graded Questions Content:
                %s
                """, jobTitle, questionsList.toString());

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            String cleaned = cleanJson(response);
            JsonNode node = objectMapper.readTree(cleaned);

            return TestFeedback.builder()
                    .weakTopics(text(node, "weakTopics"))
                    .strengths(text(node, "strengths"))
                    .improvementSuggestions(text(node, "improvementSuggestions"))
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate test feedback: {}", e.getMessage());
            return TestFeedback.builder()
                    .weakTopics("Analysis of weak topics failed. Please try again.")
                    .strengths("Analysis of strengths failed. Please try again.")
                    .improvementSuggestions("Suggestions for improvement failed. Please try again.")
                    .build();
        }
    }

    // ── 7. SEMANTIC SEARCH EMBEDDINGS ──────────────────────────
    public float[] getEmbedding(String text) {
        try {
            return embeddingModel.embed(text);
        } catch (Exception e) {
            log.error("Failed to generate embedding: {}", e.getMessage());
            return new float[768]; // fallback vector size
        }
    }

    public double calculateCosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null || vectorA.length != vectorB.length) {
            return 0.0;
        }
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += Math.pow(vectorA[i], 2);
            normB += Math.pow(vectorB[i], 2);
        }
        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // ── Helpers ────────────────────────────────────────────────
    private String cleanJson(String response) {
        if (response == null) return "{}";
        return response
                .replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();
    }

    private String text(JsonNode node, String field) {
        JsonNode v = node.path(field);
        return (v.isMissingNode() || v.isNull()) ? "" : v.asText();
    }

    // ── Result types ───────────────────────────────────────────

    @lombok.Data @lombok.Builder @lombok.NoArgsConstructor @lombok.AllArgsConstructor
    public static class ParsedResume {
        private String fullName;
        private String email;
        private String phone;
        private String city;
        private String state;
        private String currentRole;
        private int totalYearsExperience;
        private String summary;
        private List<String> skills;
        private List<WorkExpData> workExperiences;
        private List<EducationData> educations;
        private List<ProjectData> projects;
        private List<CertData> certifications;
        private List<LanguageData> languages;
    }

    @lombok.Data @lombok.Builder @lombok.NoArgsConstructor @lombok.AllArgsConstructor
    public static class WorkExpData {
        private String companyName;
        private String jobTitle;
        private String employmentType;
        private String startMonth;
        private int startYear;
        private String endMonth;
        private int endYear;
        @JsonProperty("isCurrentJob")
        private boolean isCurrentJob;
        private String description;
        private String location;
        private List<String> skillsUsed;
    }

    @lombok.Data @lombok.Builder @lombok.NoArgsConstructor @lombok.AllArgsConstructor
    public static class EducationData {
        private String degree;
        private String fieldOfStudy;
        private String instituteName;
        private String boardOrUniversity;
        private int startYear;
        private int endYear;
        private String grade;
        private String gradeType;
        @JsonProperty("isCurrentlyStudying")
        private boolean isCurrentlyStudying;
    }

    @lombok.Data @lombok.Builder @lombok.NoArgsConstructor @lombok.AllArgsConstructor
    public static class ProjectData {
        private String projectTitle;
        private String projectDescription;
        private List<String> technologiesUsed;
        private String projectUrl;
        private String githubUrl;
        private String startMonth;
        private int startYear;
        private String endMonth;
        private int endYear;
        @JsonProperty("isOngoing")
        private boolean isOngoing;
    }

    @lombok.Data @lombok.Builder @lombok.NoArgsConstructor @lombok.AllArgsConstructor
    public static class CertData {
        private String certificationName;
        private String issuingOrganization;
        private String issueMonth;
        private int issueYear;
        private int expiryYear;
        @JsonProperty("doesNotExpire")
        private boolean doesNotExpire;
        private String credentialId;
        private String credentialUrl;
    }

    @lombok.Data @lombok.Builder @lombok.NoArgsConstructor @lombok.AllArgsConstructor
    public static class LanguageData {
        private String languageName;
        private String proficiency;
    }

    public record MatchResult(
        int score,
        String reason,
        boolean knockoutPass,
        String failedKnockoutQuestion,
        int skillsScore,
        int experienceScore,
        int educationScore,
        int projectsScore
    ) {
        public MatchResult(int score, String reason) {
            this(score, reason, true, "", 0, 0, 0, 0);
        }
    }

    @lombok.Data @lombok.Builder
    public static class GeneratedQuestion {
        private int questionNumber;
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctAnswer;
    }

    @lombok.Data @lombok.Builder
    public static class TestFeedback {
        private String weakTopics;
        private String strengths;
        private String improvementSuggestions;
    }
}