package com.servicematchmaker.repository;

import com.servicematchmaker.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByEventId(Long eventId);
    List<Registration> findByVolunteerId(Long volunteerId);
    boolean existsByVolunteerIdAndEventId(Long volunteerId, Long eventId);
    List<Registration> findByEventIdAndStatus(Long eventId, String status);
    Optional<Registration> findByVolunteerIdAndEventId(Long volunteerId, Long eventId);
}