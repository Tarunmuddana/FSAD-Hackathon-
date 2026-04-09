import { calculateMatch } from '../utils/matchUtils.js';

// ============================================================
// SERVICE MATCHMAKER — API LAYER
//
// HOW TO SWITCH TO REAL BACKEND:
//   Set USE_MOCK = false below.
//   The backend must be running on http://localhost:8080
//   (Spring Boot, see README.md for setup).
// ============================================================

const BASE_URL = "http://localhost:8080/api";
export const USE_MOCK = true;  // ← Backend is now live — Spring Boot on http://localhost:8080

// ============================================================
// MOCK DATA WITH LOCALSTORAGE PERSISTENCE
// ============================================================
const loadMockData = (key, defaultData) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
};

const saveMockData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

let mockVolunteers = loadMockData('mockVolunteers', [
  { id: 1, name: "Demo User", email: "demo@demo.com", password: "demo", skills: "Java, Spring Boot, React, JavaScript, Public Speaking, Leadership, Python, AWS", hoursLogged: 124.5 },
  { id: 2, name: "Alice S",  email: "alice@demo.com",  password: "demo", skills: "JavaScript, React, CSS, Node.js", hoursLogged: 42.0 },
  { id: 3, name: "Bob J",    email: "bob@demo.com",    password: "demo", skills: "Python, Django, Public Speaking, SQL", hoursLogged: 18.5 },
  { id: 4, name: "Charlie",  email: "charlie@demo.com",password: "demo", skills: "React, Leadership, UI/UX",        hoursLogged: 55.0 },
  { id: 5, name: "Eve Hack", email: "eve@demo.com",    password: "demo", skills: "Java, C++, Algorithms, Git",      hoursLogged: 12.0 },
  { id: 6, name: "Frank T",  email: "frank@demo.com",  password: "demo", skills: "Graphic Design, CSS, Marketing",  hoursLogged: 95.5 },
]);

// Force-update Demo User if already in storage to ensure demo data populates without needing to clear storage during presentation
const demoIdx = mockVolunteers.findIndex(v => v.id === 1);
if (demoIdx !== -1) {
  mockVolunteers[demoIdx].skills = "Java, Spring Boot, React, JavaScript, Public Speaking, Leadership, Python, AWS";
  mockVolunteers[demoIdx].hoursLogged = 124.5;
  saveMockData('mockVolunteers', mockVolunteers);
}

const DEFAULT_EVENTS = [
  { id: 1,  title: "Community Cleanup Drive",         date: "Sat", time: "10:00 AM", description: "Help restore the local park and waterfront areas. Bring gloves and water!",               requiredSkill: "Java",                         requiredVolunteers: 10, currentVolunteers: 5,  duration: 4,  status: "UPCOMING" },
  { id: 2,  title: "Web Dev Workshop",                date: "Sat", time: "10:00 AM", description: "Teach beginners JavaScript & React fundamentals. Laptops will be provided.",              requiredSkill: "JavaScript, React",            requiredVolunteers: 5,  currentVolunteers: 2,  duration: 6,  status: "UPCOMING" },
  { id: 3,  title: "Backend Bootcamp",                date: "Sun", time: "2:00 PM",  description: "Guide juniors through Spring Boot & REST APIs. Great for mentors!",                       requiredSkill: "Java, Spring Boot",            requiredVolunteers: 4,  currentVolunteers: 1,  duration: 8,  status: "UPCOMING" },
  { id: 4,  title: "Python for Data Science",         description: "Mentoring session covering pandas & scikit-learn. All levels welcome.",                   requiredSkill: "Python",                       requiredVolunteers: 3,  currentVolunteers: 1,  duration: 5,  status: "UPCOMING" },
  { id: 5,  title: "UI/UX Design Sprint",             description: "Collaborate on a real-world mobile app design with industry mentors.",                     requiredSkill: "CSS, React",                   requiredVolunteers: 6,  currentVolunteers: 4,  duration: 3,  status: "UPCOMING" },
  { id: 6,  title: "Hackathon Mentorship",            description: "Help student teams over a full 24h hackathon weekend. Food & energy drinks included!",    requiredSkill: "React, Java, Python",          requiredVolunteers: 12, currentVolunteers: 7,  duration: 24, status: "UPCOMING" },
  { id: 7,  title: "Tree Plantation Drive",           description: "Join us to plant 500 trees in the city outskirts and restore biodiversity.",              requiredSkill: "Leadership",                   requiredVolunteers: 20, currentVolunteers: 8,  duration: 5,  status: "UPCOMING" },
  { id: 8,  title: "Digital Literacy for Seniors",   description: "Teach senior citizens how to use smartphones, WhatsApp, and online banking safely.",      requiredSkill: "Public Speaking, JavaScript",  requiredVolunteers: 8,  currentVolunteers: 3,  duration: 3,  status: "UPCOMING" },
  { id: 9,  title: "Mobile App Dev Workshop",         description: "Hands-on session building a React Native to-do app from scratch for college students.",    requiredSkill: "React, JavaScript",            requiredVolunteers: 6,  currentVolunteers: 5,  duration: 6,  status: "UPCOMING" },
  { id: 10, title: "Mental Health Awareness Talk",    description: "Facilitate an open conversation about mental wellness and coping strategies at a school.", requiredSkill: "Public Speaking",              requiredVolunteers: 3,  currentVolunteers: 1,  duration: 2,  status: "UPCOMING" },
  { id: 11, title: "AI & Ethics Seminar",             description: "Lead a panel discussion on responsible AI development for engineering undergrads.",        requiredSkill: "Python, Public Speaking",       requiredVolunteers: 4,  currentVolunteers: 2,  duration: 3,  status: "UPCOMING" },
  { id: 12, title: "Open Source Day",                 description: "Help beginners make their first open source contribution. Bring cool project ideas!",      requiredSkill: "Git, JavaScript, Python",      requiredVolunteers: 15, currentVolunteers: 6,  duration: 8,  status: "UPCOMING" },
  { id: 13, title: "Cyber Security Awareness",        description: "Educate employees at a local NGO about phishing, passwords and data safety.",              requiredSkill: "Java, Spring Boot",            requiredVolunteers: 3,  currentVolunteers: 0,  duration: 4,  status: "UPCOMING" },
  { id: 14, title: "Food Distribution Drive",         description: "Help sort, pack and distribute food parcels to underprivileged families this weekend.",    requiredSkill: "Leadership",                   requiredVolunteers: 25, currentVolunteers: 15, duration: 6,  status: "UPCOMING" },
  { id: 15, title: "Graphic Design for NGOs",         description: "Create social media banners and posters for 3 local non-profit organizations.",            requiredSkill: "CSS",                          requiredVolunteers: 4,  currentVolunteers: 1,  duration: 10, status: "UPCOMING" },
  { id: 16, title: "Cloud Computing Workshop",        description: "Teach AWS fundamentals and deployment to a group of final-year engineering students.",      requiredSkill: "Java, Python",                 requiredVolunteers: 5,  currentVolunteers: 2,  duration: 7,  status: "UPCOMING" },
  { id: 17, title: "Database Design Bootcamp",        description: "Run a workshop covering SQL, normalization, and indexing for data science aspirants.",     requiredSkill: "Python, Django",               requiredVolunteers: 5,  currentVolunteers: 4,  duration: 5,  status: "UPCOMING" },
  { id: 18, title: "Accessibility in Tech",           description: "Conduct a session on building inclusive, WCAG-compliant web apps at a tech conferences.",  requiredSkill: "CSS, React, JavaScript",       requiredVolunteers: 4,  currentVolunteers: 0,  duration: 4,  status: "UPCOMING" },
  { id: 19, title: "Resume Writing Workshop",         description: "Guide college students through crafting job-winning tech resumes and LinkedIn profiles.",  requiredSkill: "Public Speaking",              requiredVolunteers: 5,  currentVolunteers: 2,  duration: 3,  status: "UPCOMING" },
  { id: 20, title: "Game Dev Intro with Unity",       description: "Teach the basics of Unity game development to curious beginners aged 15–25.",             requiredSkill: "JavaScript, Python",           requiredVolunteers: 6,  currentVolunteers: 1,  duration: 8,  status: "UPCOMING" },
];

// Smart merge: keep user-created events, add any missing seed events
const storedEvents = localStorage.getItem('mockEvents');
let mockEvents;
if (storedEvents) {
  const parsed = JSON.parse(storedEvents);
  const existingIds = new Set(parsed.map(e => e.id));
  const newSeeds = DEFAULT_EVENTS.filter(e => !existingIds.has(e.id));
  mockEvents = [...parsed, ...newSeeds];
  if (newSeeds.length > 0) saveMockData('mockEvents', mockEvents);
} else {
  mockEvents = [...DEFAULT_EVENTS];
  saveMockData('mockEvents', mockEvents);
}


const DEFAULT_REGISTRATIONS = [
  // Demo User is fully stacked for presentation
  { volunteerId: 1, eventId: 1,  status: 'APPROVED' },
  { volunteerId: 1, eventId: 3,  status: 'PENDING'  },
  { volunteerId: 1, eventId: 6,  status: 'APPROVED' },
  { volunteerId: 1, eventId: 8,  status: 'APPROVED' },
  { volunteerId: 1, eventId: 14, status: 'PENDING'  },
  
  // Showcase Events 1 & 2 heavily packed with applicants (Alice, Bob, Charlie, Eve, Frank)
  { volunteerId: 2, eventId: 1,  status: 'PENDING'  },
  { volunteerId: 3, eventId: 1,  status: 'APPROVED' },
  { volunteerId: 4, eventId: 1,  status: 'REJECTED' },
  { volunteerId: 5, eventId: 1,  status: 'PENDING'  },
  { volunteerId: 6, eventId: 1,  status: 'PENDING'  },

  { volunteerId: 2, eventId: 2,  status: 'APPROVED' },
  { volunteerId: 3, eventId: 2,  status: 'PENDING'  },
  { volunteerId: 4, eventId: 2,  status: 'APPROVED' },
  { volunteerId: 5, eventId: 2,  status: 'PENDING'  },
  { volunteerId: 6, eventId: 2,  status: 'REJECTED' },

  { volunteerId: 2, eventId: 3,  status: 'APPROVED' },
  { volunteerId: 3, eventId: 3,  status: 'PENDING'  },
  { volunteerId: 4, eventId: 3,  status: 'PENDING'  },
  { volunteerId: 5, eventId: 3,  status: 'APPROVED' },

  // Scattered noise mapping
  { volunteerId: 3, eventId: 4,  status: 'PENDING'  },
  { volunteerId: 2, eventId: 5,  status: 'PENDING'  },
  { volunteerId: 3, eventId: 5,  status: 'REJECTED' },
  { volunteerId: 2, eventId: 6,  status: 'APPROVED' },
  { volunteerId: 3, eventId: 6,  status: 'PENDING'  },
  { volunteerId: 4, eventId: 6,  status: 'APPROVED' },
  { volunteerId: 2, eventId: 7,  status: 'PENDING'  },
  { volunteerId: 3, eventId: 7,  status: 'APPROVED' },
  { volunteerId: 4, eventId: 8,  status: 'PENDING'  },
  { volunteerId: 5, eventId: 8,  status: 'APPROVED' },
  { volunteerId: 2, eventId: 9,  status: 'PENDING'  },
  { volunteerId: 3, eventId: 9,  status: 'APPROVED' },
  { volunteerId: 4, eventId: 10, status: 'PENDING'  },
  { volunteerId: 5, eventId: 11, status: 'APPROVED' },
  { volunteerId: 6, eventId: 12, status: 'PENDING'  },
  { volunteerId: 4, eventId: 14, status: 'PENDING'  },
  { volunteerId: 2, eventId: 14, status: 'APPROVED' },
];

// Smart merge: never overwrite user-made registrations, just add missing seeds
const storedRegs = localStorage.getItem('mockRegistrations');
let mockRegistrations;
if (storedRegs) {
  const parsedRegs = JSON.parse(storedRegs);
  const regKey = r => `${r.volunteerId}-${r.eventId}`;
  const existingKeys = new Set(parsedRegs.map(regKey));
  const newSeeds = DEFAULT_REGISTRATIONS.filter(r => !existingKeys.has(regKey(r)));
  mockRegistrations = [...parsedRegs, ...newSeeds];
  if (newSeeds.length > 0) saveMockData('mockRegistrations', mockRegistrations);
} else {
  mockRegistrations = [...DEFAULT_REGISTRATIONS];
  saveMockData('mockRegistrations', mockRegistrations);
}

const saveAllMockState = () => {
  saveMockData('mockVolunteers', mockVolunteers);
  saveMockData('mockEvents', mockEvents);
  saveMockData('mockRegistrations', mockRegistrations);
};

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================================
// AUTH ENDPOINTS  — /api/auth/*
// Spec: README.md from backend team
// ============================================================

/**
 * POST /api/auth/register
 * Body: { name, email, password, skills, hoursLogged }
 * Returns: Volunteer object (or throws on conflict)
 */
export const authRegister = async ({ name, email, password, skills }) => {
  if (USE_MOCK) {
    await delay(400);
    const existing = mockVolunteers.find(v => v.email === email);
    if (existing) throw new Error("Email already registered.");
    const newUser = { id: mockVolunteers.length + 1, name, email, password, skills: skills || "", hoursLogged: 0 };
    mockVolunteers.push(newUser);
    saveAllMockState();
    return newUser;
  }
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, skills, hoursLogged: 0 })
  });
  if (!res.ok) throw new Error(await res.text() || "Registration failed");
  return res.json();
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: Volunteer object
 */
export const authLogin = async (email, password) => {
  if (USE_MOCK) {
    await delay(300);
    const vol = mockVolunteers.find(v => v.email === email && v.password === password);
    if (!vol) throw new Error("Invalid email or password.");
    return vol;
  }
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
};

/**
 * GET /api/auth/profile/:id
 * Returns: Volunteer object
 */
export const getProfile = async (id) => {
  if (USE_MOCK) {
    await delay(200);
    const vol = mockVolunteers.find(v => v.id === Number(id));
    if (!vol) throw new Error("Volunteer not found");
    return vol;
  }
  return fetch(`${BASE_URL}/auth/profile/${id}`).then(r => r.json());
};

export const updateProfile = async (id, profileData) => {
  if (USE_MOCK) {
    await delay(400);
    const vol = mockVolunteers.find(v => v.id === Number(id));
    if (!vol) throw new Error("Volunteer not found");
    Object.assign(vol, profileData);
    saveAllMockState();
    return vol;
  }
  return fetch(`${BASE_URL}/auth/profile/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData)
  }).then(r => r.json());
};

export const getVolunteers = async () => {
  if (USE_MOCK) {
    await delay(200);
    return mockVolunteers;
  }
  return fetch(`${BASE_URL}/volunteers`).then(r => r.json());
};

export const getMyRegistrations = async (volunteerId) => {
  if (USE_MOCK) {
    await delay(200);
    return mockRegistrations.filter(r => r.volunteerId === Number(volunteerId));
  }
  return fetch(`${BASE_URL}/actions/registrations/${volunteerId}`).then(r => r.json());
};

export const updateResume = async (volunteerId, resumeName, resumeData) => {
  if (USE_MOCK) {
    await delay(600);
    const vol = mockVolunteers.find(v => v.id === Number(volunteerId));
    if (vol) {
      vol.resumeName = resumeName;
      vol.resumeData = resumeData;
      saveAllMockState();
      return vol;
    }
    throw new Error("Volunteer not found.");
  }
  // Real backend implementation
  return fetch(`${BASE_URL}/volunteers/${volunteerId}/resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeName, resumeData })
  }).then(r => r.json());
};

export const deleteResume = async (volunteerId) => {
  if (USE_MOCK) {
    await delay(400);
    const vol = mockVolunteers.find(v => v.id === Number(volunteerId));
    if (vol) {
      delete vol.resumeName;
      delete vol.resumeData;
      saveAllMockState();
      return vol;
    }
  }
  return fetch(`${BASE_URL}/volunteers/${volunteerId}/resume`, { method: "DELETE" }).then(r => r.json());
};

// ============================================================
// EVENT ENDPOINTS  — /api/events/*
// Specification matches EventController.java
// ============================================================

export const getEvents = async () => {
  if (USE_MOCK) {
    await delay(400);
    // Compute currentVolunteers dynamically from actual registrations so table matches Manage Candidates
    return [...mockEvents].reverse().map(ev => ({
      ...ev,
      currentVolunteers: mockRegistrations.filter(r => r.eventId === ev.id).length
    }));
  }
  return fetch(`${BASE_URL}/events`).then(r => r.json());
};

export const createEvent = async (eventData) => {
  if (USE_MOCK) {
    await delay(500);
    const newEvent = {
      ...eventData,
      id: Math.max(0, ...mockEvents.map(e => e.id)) + 1,
      currentVolunteers: 0,
      status: "UPCOMING"
    };
    mockEvents.push(newEvent);
    saveAllMockState();
    return newEvent;
  }
  return fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  }).then(r => r.json());
};

export const updateEvent = async (id, eventData) => {
  if (USE_MOCK) {
    await delay(400);
    const idx = mockEvents.findIndex(e => e.id === Number(id));
    if (idx !== -1) {
      mockEvents[idx] = { ...mockEvents[idx], ...eventData };
      saveAllMockState();
      return mockEvents[idx];
    }
    throw new Error("Event not found");
  }
  return fetch(`${BASE_URL}/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  }).then(r => r.json());
};

export const getEvent = async (id) => {
  if (USE_MOCK) {
    await delay(200);
    return mockEvents.find(e => e.id === Number(id));
  }
  return fetch(`${BASE_URL}/events/${id}`).then(r => r.json());
};

export const deleteEvent = async (id) => {
  if (USE_MOCK) {
    await delay(300);
    mockEvents = mockEvents.filter(e => e.id !== Number(id));
    saveAllMockState();
    return;
  }
  return fetch(`${BASE_URL}/events/${id}`, { method: "DELETE" });
};

// ============================================================
// ACTION ENDPOINTS  — /api/actions/*
// ============================================================

/**
 * GET /api/actions/match/:volunteerId
 * Returns: [{ event, compatibilityScore }]
 */
export const getMatchesForVolunteer = async (volunteerId) => {
  if (USE_MOCK) {
    await delay(300);
    const matchUtils = await import('../utils/matchUtils.js');
    const calculateMatch = matchUtils.calculateMatch;
    const vol = mockVolunteers.find(v => v.id === Number(volunteerId));
    return mockEvents.map(ev => ({
      event: ev,
      compatibilityScore: calculateMatch(vol?.skills, ev.requiredSkill).matchPercentage,
    }));
  }
  return fetch(`${BASE_URL}/actions/match/${volunteerId}`).then(r => r.json());
};

/**
 * POST /api/actions/register?volunteerId=&eventId=
 * Returns: "Successfully registered for the event."
 */
export const registerForEvent = async (volunteerId, eventId) => {
  if (USE_MOCK) {
    await delay(400);
    const targetEvent = mockEvents.find(e => e.id === Number(eventId));
    if (!targetEvent) throw new Error("Event not found");

    // Collision Detection: If user has a PENDING/APPROVED registration for an event at the exact same day/time
    if (targetEvent.date && targetEvent.time) {
      const userRegs = mockRegistrations.filter(r => r.volunteerId === Number(volunteerId) && r.status !== 'REJECTED');
      for (const reg of userRegs) {
        const existingEvent = mockEvents.find(e => e.id === reg.eventId);
        if (existingEvent && existingEvent.date === targetEvent.date && existingEvent.time === targetEvent.time) {
          throw new Error(`Schedule collision! You are already booked for '${existingEvent.title}' at this precise time.`);
        }
      }
    }

    mockRegistrations.push({ volunteerId: Number(volunteerId), eventId: Number(eventId), status: 'PENDING' });
    if (targetEvent) targetEvent.currentVolunteers += 1; // Optimistic count
    saveAllMockState();
    return "Successfully registered for the event.";
  }
  return fetch(`${BASE_URL}/actions/register?volunteerId=${volunteerId}&eventId=${eventId}`, { method: "POST" }).then(r => r.text());
};

/**
 * DELETE /api/actions/unregister?volunteerId=&eventId=
 * Returns: "Successfully unregistered from the event."
 */
export const unregisterFromEvent = async (volunteerId, eventId) => {
  if (USE_MOCK) {
    await delay(300);
    const index = mockRegistrations.findIndex(r => r.volunteerId === Number(volunteerId) && r.eventId === Number(eventId));
    if (index !== -1) {
      mockRegistrations.splice(index, 1);
      const ev = mockEvents.find(e => e.id === Number(eventId));
      if (ev && ev.currentVolunteers > 0) ev.currentVolunteers -= 1;
      saveAllMockState();
      return "Successfully unregistered from the event.";
    }
    throw new Error("Registration not found.");
  }
  return fetch(`${BASE_URL}/actions/unregister?volunteerId=${volunteerId}&eventId=${eventId}`, { method: "DELETE" }).then(r => r.text());
};

/**
 * GET /api/actions/applicants/:eventId
 * Returns: [{ volunteer, status, matchScore }]
 */
export const getApplicantsForEvent = async (eventId) => {
  if (USE_MOCK) {
    await delay(300);
    const ev = mockEvents.find(e => e.id === Number(eventId));
    const regs = mockRegistrations.filter(r => r.eventId === Number(eventId));
    const matchUtils = await import('../utils/matchUtils.js');
    const calculateMatch = matchUtils.calculateMatch;
    
    return regs.map(r => {
      const vol = mockVolunteers.find(v => v.id === r.volunteerId);
      const score = calculateMatch(vol?.skills, ev?.requiredSkill).matchPercentage;
      return {
        volunteer: vol,
        status: r.status,
        matchScore: score
      };
    }).filter(a => a.volunteer != null);
  }
  return fetch(`${BASE_URL}/actions/applicants/${eventId}`).then(r => r.json());
};

/**
 * PUT /api/actions/applicants/:eventId/:volunteerId
 * Body: { status: 'APPROVED' | 'REJECTED' }
 */
export const updateApplicantStatus = async (eventId, volunteerId, status) => {
  if (USE_MOCK) {
    await delay(200);
    const reg = mockRegistrations.find(r => r.eventId === Number(eventId) && r.volunteerId === Number(volunteerId));
    if (reg) { reg.status = status; }
    saveAllMockState();
    return "Success";
  }
  return fetch(`${BASE_URL}/actions/applicants/${eventId}/${volunteerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  }).then(r => r.text());
};

/**
 * POST /api/actions/complete/:eventId
 * Returns: "Event completed successfully. Logged X hours for Y volunteers."
 */
export const completeEvent = async (eventId) => {
  if (USE_MOCK) {
    await delay(400);
    const ev = mockEvents.find(e => e.id === Number(eventId));
    if (ev) {
      ev.status = "COMPLETED";
      // Credit hours to all registered volunteers (gamification)
      const regs = mockRegistrations.filter(r => r.eventId === Number(eventId));
      regs.forEach(r => {
        const vol = mockVolunteers.find(v => v.id === r.volunteerId);
        if (vol) vol.hoursLogged += ev.duration;
      });
      saveAllMockState();
      return `Event completed successfully. Logged ${ev.duration} hours for ${ev.currentVolunteers} volunteers.`;
    }
    throw new Error("Event not found");
  }
  return fetch(`${BASE_URL}/actions/complete/${eventId}`, { method: "POST" }).then(r => r.text());
};

// ============================================================
// SYSTEM HELPERS
// ============================================================

export const seedMockData = () => {
  // Only the Java backend has a separate seed trigger endpoint right now.
  return Promise.resolve("Seed successful");
};
