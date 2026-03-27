package com.servicematchmaker.dto;

import com.servicematchmaker.model.Event;

public class MatchResultDTO {
    private Event event;
    private int compatibilityScore;

    public MatchResultDTO(Event event, int compatibilityScore) {
        this.event = event;
        this.compatibilityScore = compatibilityScore;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public int getCompatibilityScore() {
        return compatibilityScore;
    }

    public void setCompatibilityScore(int compatibilityScore) {
        this.compatibilityScore = compatibilityScore;
    }
}