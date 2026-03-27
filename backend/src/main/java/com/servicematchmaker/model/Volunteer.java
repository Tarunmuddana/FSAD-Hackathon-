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

    private String skills;

    @Column(name = "hours_logged")
    private double hoursLogged;

    private String email;

    private String password;

    private String phone;

    private String address;

    public Volunteer() {
    }

    public Volunteer(String name, String skills, double hoursLogged) {
        this.name = name;
        this.skills = skills;
        this.hoursLogged = hoursLogged;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public double getHoursLogged() { return hoursLogged; }
    public void setHoursLogged(double hoursLogged) { this.hoursLogged = hoursLogged; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}