package com.servicematchmaker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "volunteers")
public class Volunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String skills;

    @Column(name = "hours_logged")
    private double hoursLogged;

    public Volunteer() {}

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public double getHoursLogged() { return hoursLogged; }
    public void setHoursLogged(double hoursLogged) { this.hoursLogged = hoursLogged; }
}
