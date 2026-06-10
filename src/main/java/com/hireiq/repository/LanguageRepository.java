package com.hireiq.repository;

import com.hireiq.entity.CandidateProfile;
import com.hireiq.entity.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LanguageRepository extends JpaRepository<Language, Long> {
    List<Language> findByCandidateProfile(CandidateProfile profile);

    @Modifying
    void deleteByCandidateProfileAndIsAiExtracted(CandidateProfile profile, boolean isAiExtracted);
}
