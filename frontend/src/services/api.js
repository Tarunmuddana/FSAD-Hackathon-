const BASE_URL = "http://localhost:8080/api";
const USE_MOCK = true; // Set to false to hit the real backend

// Mock Data
const mockVolunteers = [
  { id: 1, name: "Tarun M", skills: "Java, React, Python", hoursLogged: 42.5 },
  { id: 2, name: "Alice S", skills: "Figma, React, CSS", hoursLogged: 12.0 },
  { id: 3, name: "Bob J", skills: "Public Speaking, Organizing", hoursLogged: 5.5 }
];

let mockEvents = [
  { id: 1, title: "Beach Cleanup", description: "Help clean the local beach.", requiredSkill: "Teamwork", requiredVolunteers: 10, currentVolunteers: 6 },
  { id: 2, title: "Code Workshop", description: "Teach beginners how to code.", requiredSkill: "React", requiredVolunteers: 5, currentVolunteers: 2 },
  { id: 3, title: "Design Sprint", description: "Design an app prototype.", requiredSkill: "Figma", requiredVolunteers: 3, currentVolunteers: 1 },
  { id: 4, title: "Python Mentoring", description: "Mentor junior developers.", requiredSkill: "Python, Java", requiredVolunteers: 2, currentVolunteers: 1 }
];

// Helper for mock delay
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// --- API Methods ---

export const getEvents = async () => {
  if (USE_MOCK) {
    await delay(300);
    return mockEvents;
  }
  return fetch(`${BASE_URL}/events`).then(r => r.json());
};

export const getEventById = async (id) => {
  if (USE_MOCK) {
    await delay(200);
    return mockEvents.find(e => e.id === Number(id));
  }
  return fetch(`${BASE_URL}/events/${id}`).then(r => r.json());
};

export const createEvent = async (data) => {
  if (USE_MOCK) {
    await delay(400);
    const newEvent = { ...data, id: mockEvents.length + 1, currentVolunteers: 0 };
    mockEvents.push(newEvent);
    return newEvent;
  }
  return fetch(`${BASE_URL}/events`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify(data) 
  }).then(r => r.json());
};

export const getVolunteers = async () => {
  if (USE_MOCK) {
    await delay(300);
    return mockVolunteers;
  }
  return fetch(`${BASE_URL}/volunteers`).then(r => r.json());
};

export const getVolunteer = async (id) => {
  if (USE_MOCK) {
    await delay(200);
    return mockVolunteers.find(v => v.id === Number(id));
  }
  return fetch(`${BASE_URL}/volunteers/${id}`).then(r => r.json());
};

// Convenience method to mock the current user context
export const getCurrentVolunteer = async () => {
  if (USE_MOCK) {
    await delay(200);
    return mockVolunteers[0]; // Tarun M
  }
  // In a real app this would use an auth token to reach /api/volunteers/me
  // For this exercise we just get volunteer id 1
  return getVolunteer(1);
};
