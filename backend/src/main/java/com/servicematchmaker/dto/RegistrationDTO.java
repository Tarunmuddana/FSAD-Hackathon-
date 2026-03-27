package com.servicematchmaker.dto;

public class RegistrationDTO {
    private Long registrationId;
    private Long volunteerId;
    private String volunteerName;
    private String volunteerEmail;
    private String volunteerPhone;
    private String volunteerAddress;
    private String volunteerSkills;
    private double volunteerHoursLogged;
    private Long eventId;
    private String eventTitle;
    private String status;
    private String applicationNote;
    private int compatibilityScore;

    public RegistrationDTO() {}

    public RegistrationDTO(Long registrationId, Long volunteerId, String volunteerName,
            String volunteerEmail, String volunteerPhone, String volunteerAddress,
            String volunteerSkills, double volunteerHoursLogged,
            Long eventId, String eventTitle, String status, String applicationNote, int compatibilityScore) {
        this.registrationId = registrationId;
        this.volunteerId = volunteerId;
        this.volunteerName = volunteerName;
        this.volunteerEmail = volunteerEmail;
        this.volunteerPhone = volunteerPhone;
        this.volunteerAddress = volunteerAddress;
        this.volunteerSkills = volunteerSkills;
        this.volunteerHoursLogged = volunteerHoursLogged;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.status = status;
        this.applicationNote = applicationNote;
        this.compatibilityScore = compatibilityScore;
    }

    public Long getRegistrationId() { return registrationId; }
    public void setRegistrationId(Long registrationId) { this.registrationId = registrationId; }

    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }

    public String getVolunteerName() { return volunteerName; }
    public void setVolunteerName(String volunteerName) { this.volunteerName = volunteerName; }

    public String getVolunteerEmail() { return volunteerEmail; }
    public void setVolunteerEmail(String volunteerEmail) { this.volunteerEmail = volunteerEmail; }

    public String getVolunteerPhone() { return volunteerPhone; }
    public void setVolunteerPhone(String volunteerPhone) { this.volunteerPhone = volunteerPhone; }

    public String getVolunteerAddress() { return volunteerAddress; }
    public void setVolunteerAddress(String volunteerAddress) { this.volunteerAddress = volunteerAddress; }

    public String getVolunteerSkills() { return volunteerSkills; }
    public void setVolunteerSkills(String volunteerSkills) { this.volunteerSkills = volunteerSkills; }

    public double getVolunteerHoursLogged() { return volunteerHoursLogged; }
    public void setVolunteerHoursLogged(double volunteerHoursLogged) { this.volunteerHoursLogged = volunteerHoursLogged; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getApplicationNote() { return applicationNote; }
    public void setApplicationNote(String applicationNote) { this.applicationNote = applicationNote; }

    public int getCompatibilityScore() { return compatibilityScore; }
    public void setCompatibilityScore(int compatibilityScore) { this.compatibilityScore = compatibilityScore; }
}
