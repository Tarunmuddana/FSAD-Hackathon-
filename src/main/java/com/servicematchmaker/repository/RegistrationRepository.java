package com.servicematchmaker.repository;

import com.servicematchmaker.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByVolunteerId(Long volunteerId);
    List<Registration> findByEventId(Long eventId);
    Optional<Registration> findByVolunteerIdAndEventId(Long volunteerId, Long eventId);
}
