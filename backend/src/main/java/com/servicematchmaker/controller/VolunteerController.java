package com.servicematchmaker.controller;

import com.servicematchmaker.model.Volunteer;
import com.servicematchmaker.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteers")
@CrossOrigin(origins = "*")
public class VolunteerController {

    @Autowired
    private VolunteerRepository volunteerRepository;

    @GetMapping
    public List<Volunteer> getAllVolunteers() {
        return volunteerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Volunteer> getVolunteerById(@PathVariable Long id) {
        return volunteerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Volunteer createVolunteer(@RequestBody Volunteer volunteer) {
        return volunteerRepository.save(volunteer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Volunteer> updateVolunteer(@PathVariable Long id, @RequestBody Volunteer volunteerDetails) {
        return volunteerRepository.findById(id)
                .map(volunteer -> {
                    volunteer.setName(volunteerDetails.getName());
                    volunteer.setSkills(volunteerDetails.getSkills());
                    volunteer.setHoursLogged(volunteerDetails.getHoursLogged());
                    volunteer.setPhone(volunteerDetails.getPhone());
                    volunteer.setAddress(volunteerDetails.getAddress());
                    return ResponseEntity.ok(volunteerRepository.save(volunteer));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVolunteer(@PathVariable Long id) {
        return volunteerRepository.findById(id)
                .map(volunteer -> {
                    volunteerRepository.delete(volunteer);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}