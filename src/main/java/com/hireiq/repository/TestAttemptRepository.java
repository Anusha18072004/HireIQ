package com.hireiq.repository;

import com.hireiq.entity.JobPosting;
import com.hireiq.entity.TestAttempt;
import com.hireiq.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

    // All attempts by a candidate for a specific job
    List<TestAttempt> findByCandidateAndJobOrderByAttemptNumberDesc(
            User candidate, JobPosting job);

    // Latest attempt for a candidate+job combination
    Optional<TestAttempt> findTopByCandidateAndJobOrderByAttemptNumberDesc(
            User candidate, JobPosting job);

    // All attempts for a job (recruiter view)
    List<TestAttempt> findByJob(JobPosting job);

    // Check if candidate passed for a job
    boolean existsByCandidateAndJobAndStatus(
            User candidate, JobPosting job, TestAttempt.AttemptStatus status);
}