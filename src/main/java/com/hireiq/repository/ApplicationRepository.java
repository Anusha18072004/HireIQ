package com.hireiq.repository;

import com.hireiq.entity.Application;
import com.hireiq.entity.JobPosting;
import com.hireiq.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // All applications by a candidate
    List<Application> findByCandidate(User candidate);

    // All applications for a job (recruiter view) — sorted by match score
    List<Application> findByJobOrderByMatchScoreDesc(JobPosting job);

    // Check if candidate already applied for this job
    boolean existsByCandidateAndJob(User candidate, JobPosting job);

    // Get specific application
    Optional<Application> findByCandidateAndJob(User candidate, JobPosting job);

    // All applications for jobs posted by a recruiter
    List<Application> findByJob_Recruiter(User recruiter);
}