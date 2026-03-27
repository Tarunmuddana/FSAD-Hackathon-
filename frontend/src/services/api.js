/*
  API Service Layer — Connected to Spring Boot Backend
  The Vite proxy in vite.config.js forwards /api/* to http://localhost:8080
*/

const BASE_URL = "/api";

// ──── Events ────

export async function getEvents() {
  const res = await fetch(`${BASE_URL}/events`);
  if (!res.ok) throw new Error("Failed to load events");
  return res.json();
}

export async function getEventById(id) {
  const res = await fetch(`${BASE_URL}/events/${id}`);
  if (!res.ok) throw new Error("Event not found");
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function deleteEvent(id) {
  const res = await fetch(`${BASE_URL}/events/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
  return true;
}

// ──── Volunteers ────

export async function getVolunteers() {
  const res = await fetch(`${BASE_URL}/volunteers`);
  if (!res.ok) throw new Error("Failed to load volunteers");
  return res.json();
}

export async function getVolunteer(id) {
  const res = await fetch(`${BASE_URL}/volunteers/${id}`);
  if (!res.ok) throw new Error("Volunteer not found");
  return res.json();
}

export async function updateVolunteer(id, data) {
  const res = await fetch(`${BASE_URL}/volunteers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

// ──── Actions (Match, Register, Complete, My Events) ────

export async function getMatchesForVolunteer(volunteerId) {
  const res = await fetch(`${BASE_URL}/actions/match/${volunteerId}`);
  if (!res.ok) throw new Error("Failed to get matches");
  return res.json();
}

export async function registerForEvent(volunteerId, eventId) {
  const res = await fetch(`${BASE_URL}/actions/register?volunteerId=${volunteerId}&eventId=${eventId}`, {
    method: "POST"
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Registration failed");
  return text;
}

export async function completeEvent(eventId) {
  const res = await fetch(`${BASE_URL}/actions/complete/${eventId}`, { method: "POST" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to complete event");
  return text;
}

export async function getMyEvents(volunteerId) {
  const res = await fetch(`${BASE_URL}/actions/my-events/${volunteerId}`);
  if (!res.ok) throw new Error("Failed to load your events");
  return res.json();
}

// ──── Auth ────

export async function loginUser(credentials) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Invalid email or password.");
  }
  return res.json();
}

export async function registerUser(userData) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Registration failed. Email may already be in use.");
  }
  return res.json();
}

// ──── Chat ────

export async function getEventMessages(eventId) {
  const res = await fetch(`${BASE_URL}/chat/event/${eventId}`);
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
}

export async function sendEventMessage(eventId, message) {
  const res = await fetch(`${BASE_URL}/chat/event/${eventId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message)
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function getPersonalMessages(user1, user2) {
  const res = await fetch(`${BASE_URL}/chat/personal?user1=${user1}&user2=${user2}`);
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
}

export async function sendPersonalMessage(message) {
  const res = await fetch(`${BASE_URL}/chat/personal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message)
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function getChatPartners(userId) {
  const res = await fetch(`${BASE_URL}/chat/partners/${userId}`);
  if (!res.ok) throw new Error("Failed to load contacts");
  return res.json();
}
