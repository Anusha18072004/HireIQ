package com.hireiq.repository;

import com.hireiq.entity.JobPosting;
import com.hireiq.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {

    // All active jobs (for candidates browsing)
    List<JobPosting> findByStatus(JobPosting.JobStatus status);

    // All jobs posted by a specific recruiter
    List<JobPosting> findByRecruiter(User recruiter);

    // Search jobs by title containing keyword
    List<JobPosting> findByTitleContainingIgnoreCaseAndStatus(
            String keyword, JobPosting.JobStatus status);
}