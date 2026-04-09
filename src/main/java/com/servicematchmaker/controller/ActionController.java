package com.servicematchmaker.controller;

import com.servicematchmaker.model.Event;
import com.servicematchmaker.model.Registration;
import com.servicematchmaker.model.Volunteer;
import com.servicematchmaker.repository.EventRepository;
import com.servicematchmaker.repository.RegistrationRepository;
import com.servicematchmaker.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/actions")
@CrossOrigin(origins = "*")
public class ActionController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    // =====================================================================
    // GET /api/actions/match/{volunteerId}
    // Returns all events with a computed compatibilityScore.
    // =====================================================================
    @GetMapping("/match/{volunteerId}")
    public ResponseEntity<?> matchVolunteer(@PathVariable Long volunteerId) {
        Optional<Volunteer> volunteerOpt = volunteerRepository.findById(volunteerId);
        if (volunteerOpt.isEmpty()) return ResponseEntity.notFound().build();

        Volunteer volunteer = volunteerOpt.get();
        String[] volunteerSkills = (volunteer.getSkills() == null || volunteer.getSkills().isBlank())
                ? new String[0]
                : Arrays.stream(volunteer.getSkills().split(","))
                        .map(String::trim).map(String::toLowerCase).toArray(String[]::new);

        List<Event> events = eventRepository.findAll();
        List<Map<String, Object>> result = events.stream().map(event -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("event", event);

            int score = 0;
            if (event.getRequiredSkill() != null && volunteerSkills.length > 0) {
                String[] required = Arrays.stream(event.getRequiredSkill().split(","))
                        .map(String::trim).map(String::toLowerCase).toArray(String[]::new);
                long matched = Arrays.stream(required)
                        .filter(r -> Arrays.asList(volunteerSkills).contains(r)).count();
                score = required.length > 0 ? (int) Math.round((matched * 100.0) / required.length) : 0;
            }
            item.put("compatibilityScore", score);
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // =====================================================================
    // GET /api/actions/registrations/{volunteerId}
    // Returns all registrations (with status) for a given volunteer.
    // =====================================================================
    @GetMapping("/registrations/{volunteerId}")
    public ResponseEntity<?> getMyRegistrations(@PathVariable Long volunteerId) {
        List<Registration> regs = registrationRepository.findByVolunteerId(volunteerId);
        return ResponseEntity.ok(regs);
    }

    // =====================================================================
    // GET /api/actions/applicants/{eventId}
    // Returns all applicants for an event, with volunteer info + match score.
    // =====================================================================
    @GetMapping("/applicants/{eventId}")
    public ResponseEntity<?> getApplicants(@PathVariable Long eventId) {
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event event = eventOpt.get();

        List<Registration> regs = registrationRepository.findByEventId(eventId);

        List<Map<String, Object>> result = regs.stream().map(reg -> {
            Map<String, Object> item = new LinkedHashMap<>();
            Optional<Volunteer> volOpt = volunteerRepository.findById(reg.getVolunteerId());
            volOpt.ifPresent(vol -> {
                item.put("volunteer", vol);
                item.put("status", reg.getStatus());

                int score = 0;
                if (vol.getSkills() != null && event.getRequiredSkill() != null) {
                    String[] volunteerSkills = Arrays.stream(vol.getSkills().split(","))
                            .map(String::trim).map(String::toLowerCase).toArray(String[]::new);
                    String[] required = Arrays.stream(event.getRequiredSkill().split(","))
                            .map(String::trim).map(String::toLowerCase).toArray(String[]::new);
                    long matched = Arrays.stream(required)
                            .filter(r -> Arrays.asList(volunteerSkills).contains(r)).count();
                    score = required.length > 0 ? (int) Math.round((matched * 100.0) / required.length) : 0;
                }
                item.put("matchScore", score);
            });
            return item;
        }).filter(m -> !m.isEmpty()).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // =====================================================================
    // PUT /api/actions/applicants/{eventId}/{volunteerId}
    // Updates a specific applicant's status (APPROVED / REJECTED).
    // =====================================================================
    @PutMapping("/applicants/{eventId}/{volunteerId}")
    public ResponseEntity<String> updateApplicantStatus(
            @PathVariable Long eventId,
            @PathVariable Long volunteerId,
            @RequestBody Map<String, String> body) {

        Optional<Registration> regOpt = registrationRepository.findByVolunteerIdAndEventId(volunteerId, eventId);
        if (regOpt.isEmpty()) return ResponseEntity.notFound().build();

        Registration reg = regOpt.get();
        reg.setStatus(body.get("status"));
        registrationRepository.save(reg);
        return ResponseEntity.ok("Status updated.");
    }

    // =====================================================================
    // POST /api/actions/register?volunteerId=&eventId=
    // Validates schedule collisions before persisting a Registration.
    // =====================================================================
    @PostMapping("/register")
    public ResponseEntity<String> registerVolunteer(
            @RequestParam Long volunteerId,
            @RequestParam Long eventId) {

        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event targetEvent = eventOpt.get();

        // Prevent duplicate registration
        Optional<Registration> existing = registrationRepository.findByVolunteerIdAndEventId(volunteerId, eventId);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("You are already registered for this event.");
        }

        // Collision Detection: Check if a non-rejected event at the same date+time exists
        if (targetEvent.getDate() != null && targetEvent.getTime() != null) {
            List<Registration> myRegs = registrationRepository.findByVolunteerId(volunteerId);
            for (Registration reg : myRegs) {
                if ("REJECTED".equals(reg.getStatus())) continue;
                Optional<Event> existingEventOpt = eventRepository.findById(reg.getEventId());
                if (existingEventOpt.isPresent()) {
                    Event existingEvent = existingEventOpt.get();
                    if (targetEvent.getDate().equals(existingEvent.getDate())
                            && targetEvent.getTime().equals(existingEvent.getTime())) {
                        return ResponseEntity.badRequest().body(
                                "Schedule collision! You are already booked for '" + existingEvent.getTitle() + "' at this precise time."
                        );
                    }
                }
            }
        }

        // Persist registration
        Registration reg = new Registration(volunteerId, eventId, "PENDING");
        registrationRepository.save(reg);

        // Update event counter
        targetEvent.setCurrentVolunteers(targetEvent.getCurrentVolunteers() + 1);
        eventRepository.save(targetEvent);

        return ResponseEntity.ok("Successfully registered for the event.");
    }

    // =====================================================================
    // DELETE /api/actions/unregister?volunteerId=&eventId=
    // =====================================================================
    @DeleteMapping("/unregister")
    public ResponseEntity<String> unregisterVolunteer(
            @RequestParam Long volunteerId,
            @RequestParam Long eventId) {

        Optional<Registration> regOpt = registrationRepository.findByVolunteerIdAndEventId(volunteerId, eventId);
        if (regOpt.isEmpty()) return ResponseEntity.badRequest().body("Registration not found.");

        registrationRepository.delete(regOpt.get());

        Optional<Event> eventOpt = eventRepository.findById(eventId);
        eventOpt.ifPresent(event -> {
            if (event.getCurrentVolunteers() > 0) {
                event.setCurrentVolunteers(event.getCurrentVolunteers() - 1);
            }
            eventRepository.save(event);
        });

        return ResponseEntity.ok("Successfully unregistered from the event.");
    }

    // =====================================================================
    // POST /api/actions/complete/{eventId}
    // Marks the event COMPLETED and logs hours for all approved volunteers.
    // =====================================================================
    @PostMapping("/complete/{eventId}")
    public ResponseEntity<String> completeEvent(@PathVariable Long eventId) {
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) return ResponseEntity.notFound().build();

        Event event = eventOpt.get();
        event.setStatus("COMPLETED");
        eventRepository.save(event);

        // Credit hours to all APPROVED volunteers (gamification)
        List<Registration> regs = registrationRepository.findByEventId(eventId);
        long approvedCount = regs.stream().filter(r -> "APPROVED".equals(r.getStatus())).filter(r -> {
            Optional<Volunteer> volOpt = volunteerRepository.findById(r.getVolunteerId());
            if (volOpt.isPresent()) {
                Volunteer vol = volOpt.get();
                vol.setHoursLogged(vol.getHoursLogged() + event.getDuration());
                volunteerRepository.save(vol);
                return true;
            }
            return false;
        }).count();

        return ResponseEntity.ok(String.format(
                "Event completed successfully. Logged %d hours for %d approved volunteers.",
                event.getDuration(), approvedCount
        ));
    }
}
