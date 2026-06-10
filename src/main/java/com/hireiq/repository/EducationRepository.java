package com.hireiq.repository;

import com.hireiq.entity.CandidateProfile;
import com.hireiq.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByCandidateProfileOrderByOrderIndexAsc(CandidateProfile profile);

    @Modifying
    void deleteByCandidateProfileAndIsAiExtracted(CandidateProfile profile, boolean isAiExtracted);
}
