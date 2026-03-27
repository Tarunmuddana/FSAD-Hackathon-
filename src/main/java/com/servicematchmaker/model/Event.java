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

    public Event() {}

    public Event(String title, String requiredSkill, int requiredVolunteers, int currentVolunteers) {
        this.title = title;
        this.requiredSkill = requiredSkill;
        this.requiredVolunteers = requiredVolunteers;
        this.currentVolunteers = currentVolunteers;
    }

    // Getters and Setters

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
}
