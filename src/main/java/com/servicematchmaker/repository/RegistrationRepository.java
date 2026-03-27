package com.servicematchmaker.repository;

import com.servicematchmaker.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByEventId(Long eventId);

    boolean existsByVolunteerIdAndEventId(Long volunteerId, Long eventId);
}