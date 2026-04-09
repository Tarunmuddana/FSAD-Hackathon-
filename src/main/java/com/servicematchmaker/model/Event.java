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

    private String description;

    @Column(name = "required_skill")
    private String requiredSkill;

    @Column(name = "required_volunteers")
    private int requiredVolunteers;

    @Column(name = "current_volunteers")
    private int currentVolunteers;

    private int duration;

    private String date;

    private String time;

    private String status = "UPCOMING";

    public Event() {}

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRequiredSkill() { return requiredSkill; }
    public void setRequiredSkill(String requiredSkill) { this.requiredSkill = requiredSkill; }

    public int getRequiredVolunteers() { return requiredVolunteers; }
    public void setRequiredVolunteers(int requiredVolunteers) { this.requiredVolunteers = requiredVolunteers; }

    public int getCurrentVolunteers() { return currentVolunteers; }
    public void setCurrentVolunteers(int currentVolunteers) { this.currentVolunteers = currentVolunteers; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
}
