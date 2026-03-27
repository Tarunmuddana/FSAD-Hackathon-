package com.servicematchmaker.controller;

import com.servicematchmaker.model.Event;
import com.servicematchmaker.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        if (event.getStatus() == null || event.getStatus().isEmpty()) {
            event.setStatus("UPCOMING");
        }
        return eventRepository.save(event);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event eventDetails) {
        return eventRepository.findById(id)
                .map(event -> {
                    event.setTitle(eventDetails.getTitle());
                    event.setDescription(eventDetails.getDescription());
                    event.setLocation(eventDetails.getLocation());
                    event.setEventDate(eventDetails.getEventDate());
                    event.setEventTime(eventDetails.getEventTime());
                    event.setRequiredSkill(eventDetails.getRequiredSkill());
                    event.setRequiredVolunteers(eventDetails.getRequiredVolunteers());
                    event.setCurrentVolunteers(eventDetails.getCurrentVolunteers());
                    event.setDuration(eventDetails.getDuration());
                    event.setStatus(eventDetails.getStatus());
                    return ResponseEntity.ok(eventRepository.save(event));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(event -> {
                    eventRepository.delete(event);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/organized-by/{volunteerId}")
    public List<Event> getEventsOrganizedBy(@PathVariable Long volunteerId) {
        return eventRepository.findByCreatedBy(volunteerId);
    }
}