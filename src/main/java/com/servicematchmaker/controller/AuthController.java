package com.servicematchmaker.controller;

import com.servicematchmaker.model.Volunteer;
import com.servicematchmaker.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private VolunteerRepository volunteerRepository;

    /**
     * POST /api/auth/register
     * Body: { name, email, password, skills }
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Volunteer volunteer) {
        boolean exists = volunteerRepository.findAll().stream()
                .anyMatch(v -> volunteer.getEmail() != null && volunteer.getEmail().equalsIgnoreCase(v.getEmail()));
        if (exists) {
            return ResponseEntity.badRequest().body("Email already registered.");
        }
        if (volunteer.getHoursLogged() == 0) {
            volunteer.setHoursLogged(0);
        }
        Volunteer saved = volunteerRepository.save(volunteer);
        return ResponseEntity.ok(saved);
    }

    /**
     * POST /api/auth/login
     * Body: { email, password }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Volunteer credentials) {
        return volunteerRepository.findAll().stream()
                .filter(v -> credentials.getEmail() != null
                        && credentials.getEmail().equalsIgnoreCase(v.getEmail())
                        && credentials.getPassword() != null
                        && credentials.getPassword().equals(v.getPassword()))
                .findFirst()
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).body("Invalid email or password."));
    }

    /**
     * GET /api/auth/profile/{id}
     */
    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        return volunteerRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/auth/profile/{id}
     */
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Volunteer updatedData) {
        java.util.Optional<Volunteer> volunteerOpt = volunteerRepository.findById(id);
        if (volunteerOpt.isPresent()) {
            Volunteer vol = volunteerOpt.get();
            if (updatedData.getName() != null) vol.setName(updatedData.getName());
            if (updatedData.getSkills() != null) vol.setSkills(updatedData.getSkills());
            
            Volunteer saved = volunteerRepository.save(vol);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }
}
