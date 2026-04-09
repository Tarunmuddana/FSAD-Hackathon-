package com.servicematchmaker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "registrations")
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "volunteer_id", nullable = false)
    private Long volunteerId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    public Registration() {}

    public Registration(Long volunteerId, Long eventId, String status) {
        this.volunteerId = volunteerId;
        this.eventId = eventId;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
