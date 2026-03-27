package com.servicematchmaker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "sender_name")
    private String senderName;

    // For group chat: eventId is set, recipientId is null
    // For personal chat: recipientId is set, eventId is null
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "recipient_id")
    private Long recipientId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "sent_at")
    private LocalDateTime sentAt = LocalDateTime.now();

    public Message() {}

    public Message(Long senderId, String senderName, Long eventId, Long recipientId, String content) {
        this.senderId = senderId;
        this.senderName = senderName;
        this.eventId = eventId;
        this.recipientId = recipientId;
        this.content = content;
        this.sentAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
