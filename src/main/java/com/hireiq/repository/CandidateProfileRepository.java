package com.hireiq.repository;

import com.hireiq.entity.CandidateProfile;
import com.hireiq.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {

    Optional<CandidateProfile> findByUser(User user);

    Optional<CandidateProfile> findByUserId(Long userId);

    boolean existsByUser(User user);
}