package com.servicematchmaker.controller;

import com.servicematchmaker.dto.LoginRequestDTO;
import com.servicematchmaker.model.Volunteer;
import com.servicematchmaker.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private VolunteerRepository volunteerRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerVolunteer(@RequestBody Volunteer volunteer) {
        // Simple check if email already exists
        if (volunteer.getEmail() != null && !volunteer.getEmail().isEmpty()) {
            Optional<Volunteer> existingUser = volunteerRepository.findByEmail(volunteer.getEmail());
            if (existingUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already registered.");
            }
        }
        
        // Save the volunteer
        Volunteer savedVolunteer = volunteerRepository.save(volunteer);
        return ResponseEntity.ok(savedVolunteer);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        if (loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email and password must be provided.");
        }

        Optional<Volunteer> volunteerOpt = volunteerRepository.findByEmail(loginRequest.getEmail());
        
        if (volunteerOpt.isPresent()) {
            Volunteer volunteer = volunteerOpt.get();
            // Simple plain-text password check for hackathon purposes
            if (volunteer.getPassword() != null && volunteer.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.ok(volunteer);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
    }
}
