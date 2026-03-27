package com.servicematchmaker.controller;

import com.servicematchmaker.dto.MatchResultDTO;
import com.servicematchmaker.model.Event;
import com.servicematchmaker.model.Registration;
import com.servicematchmaker.model.Volunteer;
import java.util.stream.Collectors;
import com.servicematchmaker.repository.EventRepository;
import com.servicematchmaker.repository.RegistrationRepository;
import com.servicematchmaker.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/actions")
@CrossOrigin(origins = "*")
public class ActionController {

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    // 1. SMART MATCH ENGINE
    @GetMapping("/match/{volunteerId}")
    public ResponseEntity<List<MatchResultDTO>> getMatchesForVolunteer(@PathVariable Long volunteerId) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId).orElse(null);
        if (volunteer == null) {
            return ResponseEntity.notFound().build();
        }

        String vSkills = volunteer.getSkills() != null ? volunteer.getSkills().toLowerCase() : "";

        List<MatchResultDTO> matches = eventRepository.findAll().stream()
                .filter(event -> "UPCOMING".equals(event.getStatus()))
                .map(event -> {
                    int score = 0;
                    String eSkill = event.getRequiredSkill() != null ? event.getRequiredSkill().toLowerCase() : "";

                    if (eSkill.isEmpty()) {
                        score = 80; // General events are a good match for everyone
                    } else if (!vSkills.isEmpty() && vSkills.contains(eSkill)) {
                        score = 100; // Perfect exact match
                    } else if (!vSkills.isEmpty()) {
                        score = 25; // Has skills, but not the required ones
                    }

                    return new MatchResultDTO(event, score);
                })
                .sorted((a, b) -> Integer.compare(b.getCompatibilityScore(), a.getCompatibilityScore()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(matches);
    }

    // 2. REGISTRATION LOGIC
    @PostMapping("/register")
    public ResponseEntity<?> registerVolunteer(@RequestParam Long volunteerId, @RequestParam Long eventId) {
        if (registrationRepository.existsByVolunteerIdAndEventId(volunteerId, eventId)) {
            return ResponseEntity.badRequest().body("Already registered for this event.");
        }

        Volunteer volunteer = volunteerRepository.findById(volunteerId).orElse(null);
        Event event = eventRepository.findById(eventId).orElse(null);

        if (volunteer == null || event == null) {
            return ResponseEntity.badRequest().body("Volunteer or Event not found.");
        }

        if (event.getCurrentVolunteers() >= event.getRequiredVolunteers()) {
            return ResponseEntity.badRequest().body("Event is already full.");
        }

        // Save mapping
        registrationRepository.save(new Registration(volunteer, event));

        // Update Event headcount
        event.setCurrentVolunteers(event.getCurrentVolunteers() + 1);
        eventRepository.save(event);

        return ResponseEntity.ok("Successfully registered for the event.");
    }

    // 3. IMPACT TRACKER (Gamification)
    @PostMapping("/complete/{eventId}")
    public ResponseEntity<?> completeEvent(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId).orElse(null);

        if (event == null) {
            return ResponseEntity.badRequest().body("Event not found.");
        }
        if ("COMPLETED".equals(event.getStatus())) {
            return ResponseEntity.badRequest().body("Event is already marked as completed.");
        }

        // Mark as completed
        event.setStatus("COMPLETED");
        eventRepository.save(event);

        // Find all registered volunteers and add the event duration to their total
        // logged hours
        List<Registration> registrations = registrationRepository.findByEventId(eventId);
        for (Registration reg : registrations) {
            Volunteer v = reg.getVolunteer();
            v.setHoursLogged(v.getHoursLogged() + event.getDuration());
            volunteerRepository.save(v);
        }

        return ResponseEntity.ok("Event completed successfully. Logged " + event.getDuration() +
                " hours for " + registrations.size() + " volunteers.");
    }

    // 4. MY EVENTS — Get all events a volunteer is registered for
    @GetMapping("/my-events/{volunteerId}")
    public ResponseEntity<List<Event>> getMyEvents(@PathVariable Long volunteerId) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId).orElse(null);
        if (volunteer == null) {
            return ResponseEntity.notFound().build();
        }

        List<Event> myEvents = registrationRepository.findByVolunteerId(volunteerId)
                .stream()
                .map(Registration::getEvent)
                .collect(Collectors.toList());

        return ResponseEntity.ok(myEvents);
    }
}