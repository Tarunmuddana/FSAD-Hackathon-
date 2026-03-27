package com.servicematchmaker.repository;

import com.servicematchmaker.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Group chat: messages for a specific event
    List<Message> findByEventIdOrderBySentAtAsc(Long eventId);

    // Personal chat: messages between two users (both directions)
    @Query("SELECT m FROM Message m WHERE m.eventId IS NULL AND " +
           "((m.senderId = :user1 AND m.recipientId = :user2) OR " +
           "(m.senderId = :user2 AND m.recipientId = :user1)) " +
           "ORDER BY m.sentAt ASC")
    List<Message> findPersonalMessages(@Param("user1") Long user1, @Param("user2") Long user2);

    // Get list of distinct users who have messaged with a given user
    @Query("SELECT DISTINCT CASE WHEN m.senderId = :userId THEN m.recipientId ELSE m.senderId END " +
           "FROM Message m WHERE m.eventId IS NULL AND (m.senderId = :userId OR m.recipientId = :userId)")
    List<Long> findChatPartners(@Param("userId") Long userId);
}
