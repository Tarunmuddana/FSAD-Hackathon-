package com.servicematchmaker.controller;

import com.servicematchmaker.model.Message;

import com.servicematchmaker.repository.MessageRepository;
import com.servicematchmaker.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    // ── Group Chat: Get messages for an event ──
    @GetMapping("/event/{eventId}")
    public List<Message> getEventMessages(@PathVariable Long eventId) {
        return messageRepository.findByEventIdOrderBySentAtAsc(eventId);
    }

    // ── Group Chat: Send a message to an event chat ──
    @PostMapping("/event/{eventId}")
    public Message sendEventMessage(@PathVariable Long eventId, @RequestBody Message message) {
        message.setEventId(eventId);
        message.setRecipientId(null);
        return messageRepository.save(message);
    }

    // ── Personal Chat: Get messages between two users ──
    @GetMapping("/personal")
    public List<Message> getPersonalMessages(@RequestParam Long user1, @RequestParam Long user2) {
        return messageRepository.findPersonalMessages(user1, user2);
    }

    // ── Personal Chat: Send a personal message ──
    @PostMapping("/personal")
    public Message sendPersonalMessage(@RequestBody Message message) {
        message.setEventId(null);
        return messageRepository.save(message);
    }

    // ── Get chat partners for a user (for personal chat list) ──
    @GetMapping("/partners/{userId}")
    public List<Map<String, Object>> getChatPartners(@PathVariable Long userId) {
        List<Long> partnerIds = messageRepository.findChatPartners(userId);
        List<Map<String, Object>> partners = new ArrayList<>();
        for (Long partnerId : partnerIds) {
            volunteerRepository.findById(partnerId).ifPresent(v -> {
                Map<String, Object> info = new HashMap<>();
                info.put("id", v.getId());
                info.put("name", v.getName());
                info.put("email", v.getEmail());
                partners.add(info);
            });
        }
        return partners;
    }
}
