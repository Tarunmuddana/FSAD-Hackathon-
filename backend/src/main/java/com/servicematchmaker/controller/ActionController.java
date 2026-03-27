package com.servicematchmaker.controller;

import com.servicematchmaker.dto.MatchResultDTO;
import com.servicematchmaker.dto.RegistrationDTO;
import com.servicematchmaker.model.Event;
import com.servicematchmaker.model.Registration;
import com.servicematchmaker.model.Volunteer;
import com.servicematchmaker.repository.EventRepository;
import com.servicematchmaker.repository.RegistrationRepository;
import com.servicematchmaker.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
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

    // ── Helper: Convert Registration to DTO ──
    private RegistrationDTO toDTO(Registration reg) {
        Volunteer v = reg.getVolunteer();
        Event e = reg.getEvent();
        
        int score = 0;
        String eSkill = e.getRequiredSkill() != null ? e.getRequiredSkill().toLowerCase() : "";
        String vSkills = v.getSkills() != null ? v.getSkills().toLowerCase() : "";

        if (eSkill.isEmpty()) {
            score = 80; // Open to all
        } else if (!vSkills.isEmpty() && vSkills.contains(eSkill)) {
            score = 100; // Perfect match
        } else if (!vSkills.isEmpty()) {
            score = 25; // Partial match
        }

        return new RegistrationDTO(
                reg.getId(),
                v.getId(), v.getName(), v.getEmail(), v.getPhone(), v.getAddress(),
                v.getSkills(), v.getHoursLogged(),
                e.getId(), e.getTitle(),
                reg.getStatus(),
                reg.getApplicationNote(),
                score
        );
    }

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
                        score = 80;
                    } else if (!vSkills.isEmpty() && vSkills.contains(eSkill)) {
                        score = 100;
                    } else if (!vSkills.isEmpty()) {
                        score = 25;
                    }

                    return new MatchResultDTO(event, score);
                })
                .sorted((a, b) -> Integer.compare(b.getCompatibilityScore(), a.getCompatibilityScore()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(matches);
    }

    // 2. REGISTRATION LOGIC (now sets PENDING status and saves optional notes)
    @PostMapping("/register")
    public ResponseEntity<?> registerVolunteer(
            @RequestParam Long volunteerId, 
            @RequestParam Long eventId,
            @RequestParam(required = false) String notes) {
        
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

        Registration reg = new Registration(volunteer, event, notes);
        registrationRepository.save(reg);

        event.setCurrentVolunteers(event.getCurrentVolunteers() + 1);
        eventRepository.save(event);

        return ResponseEntity.ok("Successfully registered for the event.");
    }

    // 3. UNREGISTER from an event
    @DeleteMapping("/unregister")
    public ResponseEntity<?> unregisterVolunteer(@RequestParam Long volunteerId, @RequestParam Long eventId) {
        Optional<Registration> regOpt = registrationRepository.findByVolunteerIdAndEventId(volunteerId, eventId);
        if (regOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("You are not registered for this event.");
        }

        Registration reg = regOpt.get();
        registrationRepository.delete(reg);

        Event event = reg.getEvent();
        event.setCurrentVolunteers(Math.max(0, event.getCurrentVolunteers() - 1));
        eventRepository.save(event);

        return ResponseEntity.ok("Successfully unregistered from the event.");
    }

    // 4. IMPACT TRACKER (Gamification)
    @PostMapping("/complete/{eventId}")
    public ResponseEntity<?> completeEvent(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId).orElse(null);

        if (event == null) {
            return ResponseEntity.badRequest().body("Event not found.");
        }
        if ("COMPLETED".equals(event.getStatus())) {
            return ResponseEntity.badRequest().body("Event is already marked as completed.");
        }

        event.setStatus("COMPLETED");
        eventRepository.save(event);

        List<Registration> registrations = registrationRepository.findByEventId(eventId);
        for (Registration reg : registrations) {
            Volunteer v = reg.getVolunteer();
            v.setHoursLogged(v.getHoursLogged() + event.getDuration());
            volunteerRepository.save(v);
        }

        return ResponseEntity.ok("Event completed successfully. Logged " + event.getDuration() +
                " hours for " + registrations.size() + " volunteers.");
    }

    // 5. MY EVENTS — Get all events a volunteer is registered for
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

    // ════════════════════════════════════════════════
    //  CANDIDATE MANAGEMENT ENDPOINTS
    // ════════════════════════════════════════════════

    // 6. GET all applicants for an event (with optional filters)
    @GetMapping("/applicants/{eventId}")
    public ResponseEntity<List<RegistrationDTO>> getApplicants(
            @PathVariable Long eventId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String name) {

        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null) {
            return ResponseEntity.notFound().build();
        }

        List<Registration> regs;
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            regs = registrationRepository.findByEventIdAndStatus(eventId, status.toUpperCase());
        } else {
            regs = registrationRepository.findByEventId(eventId);
        }

        List<RegistrationDTO> results = regs.stream()
                .filter(reg -> {
                    if (name != null && !name.isEmpty()) {
                        String vName = reg.getVolunteer().getName() != null ? reg.getVolunteer().getName().toLowerCase() : "";
                        if (!vName.contains(name.toLowerCase())) return false;
                    }
                    if (skill != null && !skill.isEmpty()) {
                        String vSkills = reg.getVolunteer().getSkills() != null ? reg.getVolunteer().getSkills().toLowerCase() : "";
                        if (!vSkills.contains(skill.toLowerCase())) return false;
                    }
                    return true;
                })
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }

    // 7. APPROVE a candidate
    @PutMapping("/applicants/{registrationId}/approve")
    public ResponseEntity<?> approveApplicant(@PathVariable Long registrationId) {
        return registrationRepository.findById(registrationId)
                .map(reg -> {
                    reg.setStatus("APPROVED");
                    registrationRepository.save(reg);
                    return ResponseEntity.ok("Candidate approved.");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 8. REJECT a candidate
    @PutMapping("/applicants/{registrationId}/reject")
    public ResponseEntity<?> rejectApplicant(@PathVariable Long registrationId) {
        return registrationRepository.findById(registrationId)
                .map(reg -> {
                    reg.setStatus("REJECTED");
                    registrationRepository.save(reg);
                    return ResponseEntity.ok("Candidate rejected.");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 9. DATA SEEDING (GAMIFICATION/TESTING)
    @PostMapping("/seed-applicants")
    public ResponseEntity<?> seedDummyApplicants(@RequestParam Long eventId) {
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null) {
            return ResponseEntity.badRequest().body("Event not found.");
        }

        String[] firstNames = {"Alex", "Jordan", "Taylor", "Casey", "Morgan", "Riley", "Avery", "Blake"};
        String[] lastNames = {"Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson"};
        String[] possibleSkills = {"Java", "Python", "React", "Design", "Writing", "Teaching", "Event Planning", "Data Analysis", "Communication", "Marketing", "Leadership"};
        String[] notesStr = {
                "I am really passionate about this cause and have 3 years of experience in similar events.",
                "Available all day and fluent in two languages. Let me know how I can help!",
                "First time volunteering here but I learn fast and I'm very energetic.",
                "I saw the reqs and I match perfectly. Hoping to contribute my technical skills.",
                "Happy to help out wherever needed! Note: I have to leave 1 hour early."
        };
        String[] statuses = {"PENDING", "PENDING", "PENDING", "APPROVED", "REJECTED"};

        int added = 0;
        for (int i = 0; i < 5; i++) {
            if (event.getCurrentVolunteers() >= event.getRequiredVolunteers()) break;
            
            // Create dummy volunteer
            String name = firstNames[(int) (Math.random() * firstNames.length)] + " " + lastNames[(int) (Math.random() * lastNames.length)];
            String email = name.toLowerCase().replace(" ", ".") + (int)(Math.random() * 1000) + "@example.com";
            
            Volunteer v = new Volunteer();
            v.setName(name);
            v.setEmail(email);
            v.setPassword("password123");
            v.setPhone("555-" + String.format("%04d", (int)(Math.random() * 10000)));
            v.setAddress("Virtual City " + i);
            v.setSkills(possibleSkills[(int)(Math.random() * possibleSkills.length)] + ", " + possibleSkills[(int)(Math.random() * possibleSkills.length)]);
            v.setHoursLogged(Math.round(Math.random() * 50));
            
            volunteerRepository.save(v);

            // Register dummy to event
            Registration r = new Registration(v, event, notesStr[i]);
            r.setStatus(statuses[i]);
            registrationRepository.save(r);
            added++;
            
            event.setCurrentVolunteers(event.getCurrentVolunteers() + 1);
        }
        
        eventRepository.save(event);
        return ResponseEntity.ok("Seeded " + added + " dummy applicants for event: " + event.getTitle());
    }
}