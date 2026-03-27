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

    @Column(name = "required_skill")
    private String requiredSkill;

    @Column(name = "required_volunteers")
    private int requiredVolunteers;

    @Column(name = "current_volunteers")
    private int currentVolunteers;

    @Column(name = "duration_hours")
    private double duration = 0.0;

    @Column(name = "status")
    private String status = "UPCOMING"; // UPCOMING or COMPLETED

    public Event() {
    }

    public Event(String title, String requiredSkill, int requiredVolunteers, int currentVolunteers, double duration,
            String status) {
        this.title = title;
        this.requiredSkill = requiredSkill;
        this.requiredVolunteers = requiredVolunteers;
        this.currentVolunteers = currentVolunteers;
        this.duration = duration;
        this.status = status;
    }

    // Urgency Calculator: automatically exposed in JSON response as "criticalNeed":
    // true/false
    @Transient
    public boolean isCriticalNeed() {
        if (requiredVolunteers == 0 || "COMPLETED".equals(status)) {
            return false;
        }
        return ((double) currentVolunteers / requiredVolunteers) <= 0.5;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getRequiredSkill() {
        return requiredSkill;
    }

    public void setRequiredSkill(String requiredSkill) {
        this.requiredSkill = requiredSkill;
    }

    public int getRequiredVolunteers() {
        return requiredVolunteers;
    }

    public void setRequiredVolunteers(int requiredVolunteers) {
        this.requiredVolunteers = requiredVolunteers;
    }

    public int getCurrentVolunteers() {
        return currentVolunteers;
    }

    public void setCurrentVolunteers(int currentVolunteers) {
        this.currentVolunteers = currentVolunteers;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}