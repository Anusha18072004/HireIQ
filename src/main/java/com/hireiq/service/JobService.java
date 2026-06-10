package com.hireiq.service;

import com.hireiq.dto.JobDto;
import com.hireiq.entity.JobPosting;
import com.hireiq.entity.User;
import com.hireiq.repository.JobPostingRepository;
import com.hireiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;

    // ── CREATE job (recruiter only) ────────────────────────────
    public JobDto.JobResponse createJob(JobDto.JobRequest request, String recruiterEmail) {
        User recruiter = findUserByEmail(recruiterEmail);

        JobPosting.JobStatus status = JobPosting.JobStatus.ACTIVE;
        if (request.getStatus() != null) {
            try {
                status = JobPosting.JobStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                // fallback to ACTIVE
            }
        }

        JobPosting job = JobPosting.builder()
                .recruiter(recruiter)
                .title(request.getTitle())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .location(request.getLocation())
                .experienceRequired(request.getExperienceRequired())
                .salaryRange(request.getSalaryRange())
                .status(status)
                .employmentType(request.getEmploymentType())
                .workMode(request.getWorkMode())
                .openings(request.getOpenings())
                .department(request.getDepartment())
                .seniority(request.getSeniority())
                .applicationDeadline(request.getApplicationDeadline())
                .noticePeriodPreference(request.getNoticePeriodPreference())
                .educationRequirement(request.getEducationRequirement())
                .minCgpa(request.getMinCgpa())
                .preferredColleges(request.getPreferredColleges())
                .preferredSkills(request.getPreferredSkills())
                .salaryType(request.getSalaryType())
                .currency(request.getCurrency())
                .hideSalary(request.getHideSalary())
                .country(request.getCountry())
                .state(request.getState())
                .city(request.getCity())
                .hiringSteps(request.getHiringSteps())
                .expectedJoiningDate(request.getExpectedJoiningDate())
                .easyApply(request.getEasyApply())
                .resumeRequired(request.getResumeRequired())
                .portfolioRequired(request.getPortfolioRequired())
                .aiWeightSkills(request.getAiWeightSkills())
                .aiWeightExperience(request.getAiWeightExperience())
                .aiWeightEducation(request.getAiWeightEducation())
                .aiWeightProjects(request.getAiWeightProjects())
                .knockoutQuestions(request.getKnockoutQuestions())
                .build();

        return toResponse(jobPostingRepository.save(job));
    }

    // ── GET all active jobs (candidates browse) ────────────────
    public List<JobDto.JobResponse> getAllActiveJobs() {
        return jobPostingRepository
                .findByStatus(JobPosting.JobStatus.ACTIVE)
                .stream().map(this::toResponse).toList();
    }

    // ── GET single job by ID ───────────────────────────────────
    public JobDto.JobResponse getJobById(Long id) {
        return toResponse(findJobById(id));
    }

    // ── GET jobs posted by logged-in recruiter ─────────────────
    public List<JobDto.JobResponse> getMyJobs(String recruiterEmail) {
        User recruiter = findUserByEmail(recruiterEmail);
        return jobPostingRepository.findByRecruiter(recruiter)
                .stream().map(this::toResponse).toList();
    }

    // ── UPDATE job (recruiter only, must own the job) ──────────
    public JobDto.JobResponse updateJob(Long id, JobDto.JobRequest request, String recruiterEmail) {
        JobPosting job = findJobById(id);
        validateOwnership(job, recruiterEmail);

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setLocation(request.getLocation());
        job.setExperienceRequired(request.getExperienceRequired());
        job.setSalaryRange(request.getSalaryRange());

        if (request.getStatus() != null) {
            try {
                job.setStatus(JobPosting.JobStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }

        job.setEmploymentType(request.getEmploymentType());
        job.setWorkMode(request.getWorkMode());
        job.setOpenings(request.getOpenings());
        job.setDepartment(request.getDepartment());
        job.setSeniority(request.getSeniority());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setNoticePeriodPreference(request.getNoticePeriodPreference());
        job.setEducationRequirement(request.getEducationRequirement());
        job.setMinCgpa(request.getMinCgpa());
        job.setPreferredColleges(request.getPreferredColleges());
        job.setPreferredSkills(request.getPreferredSkills());
        job.setSalaryType(request.getSalaryType());
        job.setCurrency(request.getCurrency());
        job.setHideSalary(request.getHideSalary());
        job.setCountry(request.getCountry());
        job.setState(request.getState());
        job.setCity(request.getCity());
        job.setHiringSteps(request.getHiringSteps());
        job.setExpectedJoiningDate(request.getExpectedJoiningDate());
        job.setEasyApply(request.getEasyApply());
        job.setResumeRequired(request.getResumeRequired());
        job.setPortfolioRequired(request.getPortfolioRequired());
        job.setAiWeightSkills(request.getAiWeightSkills());
        job.setAiWeightExperience(request.getAiWeightExperience());
        job.setAiWeightEducation(request.getAiWeightEducation());
        job.setAiWeightProjects(request.getAiWeightProjects());
        job.setKnockoutQuestions(request.getKnockoutQuestions());

        return toResponse(jobPostingRepository.save(job));
    }

    // ── CLOSE job (recruiter only) ─────────────────────────────
    public JobDto.JobResponse closeJob(Long id, String recruiterEmail) {
        JobPosting job = findJobById(id);
        validateOwnership(job, recruiterEmail);
        job.setStatus(JobPosting.JobStatus.CLOSED);
        return toResponse(jobPostingRepository.save(job));
    }

    // ── SEARCH jobs by title keyword ───────────────────────────
    public List<JobDto.JobResponse> searchJobs(String keyword) {
        return jobPostingRepository
                .findByTitleContainingIgnoreCaseAndStatus(keyword, JobPosting.JobStatus.ACTIVE)
                .stream().map(this::toResponse).toList();
    }

    // ── Helpers ────────────────────────────────────────────────
    private JobPosting findJobById(Long id) {
        return jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private void validateOwnership(JobPosting job, String recruiterEmail) {
        if (!job.getRecruiter().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("You are not authorised to modify this job posting.");
        }
    }

    public JobDto.JobResponse toResponse(JobPosting job) {
        return JobDto.JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .requiredSkills(job.getRequiredSkills())
                .location(job.getLocation())
                .experienceRequired(job.getExperienceRequired())
                .salaryRange(job.getSalaryRange())
                .status(job.getStatus().name())
                .recruiterName(job.getRecruiter().getFullName())
                .createdAt(job.getCreatedAt())
                .employmentType(job.getEmploymentType())
                .workMode(job.getWorkMode())
                .openings(job.getOpenings())
                .department(job.getDepartment())
                .seniority(job.getSeniority())
                .applicationDeadline(job.getApplicationDeadline())
                .noticePeriodPreference(job.getNoticePeriodPreference())
                .educationRequirement(job.getEducationRequirement())
                .minCgpa(job.getMinCgpa())
                .preferredColleges(job.getPreferredColleges())
                .preferredSkills(job.getPreferredSkills())
                .salaryType(job.getSalaryType())
                .currency(job.getCurrency())
                .hideSalary(job.getHideSalary())
                .country(job.getCountry())
                .state(job.getState())
                .city(job.getCity())
                .hiringSteps(job.getHiringSteps())
                .expectedJoiningDate(job.getExpectedJoiningDate())
                .easyApply(job.getEasyApply())
                .resumeRequired(job.getResumeRequired())
                .portfolioRequired(job.getPortfolioRequired())
                .aiWeightSkills(job.getAiWeightSkills())
                .aiWeightExperience(job.getAiWeightExperience())
                .aiWeightEducation(job.getAiWeightEducation())
                .aiWeightProjects(job.getAiWeightProjects())
                .knockoutQuestions(job.getKnockoutQuestions())
                .build();
    }
}