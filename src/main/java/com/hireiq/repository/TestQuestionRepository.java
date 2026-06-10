package com.hireiq.repository;

import com.hireiq.entity.TestAttempt;
import com.hireiq.entity.TestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestQuestionRepository extends JpaRepository<TestQuestion, Long> {

    // All questions for a specific attempt (ordered by question number)
    List<TestQuestion> findByAttemptOrderByQuestionNumber(TestAttempt attempt);

    // Count correct answers for an attempt (used for scoring)
    long countByAttemptAndIsCorrect(TestAttempt attempt, Boolean isCorrect);
}