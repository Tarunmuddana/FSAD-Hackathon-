package com.servicematchmaker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;

    @Column(name = "event_date")
    private String eventDate;

    @Column(name = "event_time")
    private String eventTime;

    @Column(name = "required_skill")
    private String requiredSkill;

    @Column(name = "required_volunteers")
    private int requiredVolunteers;

    @Column(name = "current_volunteers")
    private int currentVolunteers;

    @Column(name = "duration_hours")
    private double duration = 0.0;

    @Column(name = "status")
    private String status = "UPCOMING";

    public Event() {
    }

    public Event(String title, String description, String location, String eventDate, String eventTime,
            String requiredSkill, int requiredVolunteers, int currentVolunteers, double duration, String status) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.requiredSkill = requiredSkill;
        this.requiredVolunteers = requiredVolunteers;
        this.currentVolunteers = currentVolunteers;
        this.duration = duration;
        this.status = status;
    }

    @Transient
    public boolean isCriticalNeed() {
        if (requiredVolunteers == 0 || "COMPLETED".equals(status)) {
            return false;
        }
        return ((double) currentVolunteers / requiredVolunteers) <= 0.5;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }

    public String getEventTime() { return eventTime; }
    public void setEventTime(String eventTime) { this.eventTime = eventTime; }

    public String getRequiredSkill() { return requiredSkill; }
    public void setRequiredSkill(String requiredSkill) { this.requiredSkill = requiredSkill; }

    public int getRequiredVolunteers() { return requiredVolunteers; }
    public void setRequiredVolunteers(int requiredVolunteers) { this.requiredVolunteers = requiredVolunteers; }

    public int getCurrentVolunteers() { return currentVolunteers; }
    public void setCurrentVolunteers(int currentVolunteers) { this.currentVolunteers = currentVolunteers; }

    public double getDuration() { return duration; }
    public void setDuration(double duration) { this.duration = duration; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}