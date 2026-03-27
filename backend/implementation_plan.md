# Service Matchmaker — Full-Stack Architecture Blueprint

> Single source of truth for both the **Spring Boot backend** and **React.js frontend**.

---

## 1. High-Level Architecture

```
┌──────────────────────┐         ┌───────────────────────────┐
│   React Frontend     │  HTTP   │   Spring Boot Backend     │
│   (Vite, port 5173)  │ ◄─────► │   (Maven, port 8080)      │
│                      │  JSON   │                           │
│  /services/api.js    │─────────│  /api/volunteers          │
│  (single API layer)  │         │  /api/events              │
└──────────────────────┘         └──────────┬────────────────┘
                                            │ JPA
                                   ┌────────▼────────┐
                                   │  MySQL (3306)    │
                                   │  service_matcher │
                                   └─────────────────┘
```

Frontend uses mock data initially; all API calls go through one `/services/api.js` file so the backend team simply changes the `BASE_URL`.

---

## 2. Backend (✅ Complete)

Directory, DB schema, and endpoints — already built. See [walkthrough.md](file:///C:/Users/mudda/.gemini/antigravity/brain/990d7d5e-909a-4998-84f9-403fffdb863d/walkthrough.md).

### Existing Endpoints

| Method | URL                      | Purpose                  |
|--------|--------------------------|--------------------------|
| GET    | `/api/volunteers`        | List all volunteers      |
| GET    | `/api/volunteers/{id}`   | Get volunteer by ID      |
| POST   | `/api/volunteers`        | Create volunteer         |
| PUT    | `/api/volunteers/{id}`   | Update volunteer         |
| DELETE | `/api/volunteers/{id}`   | Delete volunteer         |
| GET    | `/api/events`            | List all events          |
| GET    | `/api/events/{id}`       | Get event by ID          |
| POST   | `/api/events`            | Create event             |
| PUT    | `/api/events/{id}`       | Update event             |
| DELETE | `/api/events/{id}`       | Delete event             |

---

## 3. Frontend — React.js (To Build)

### 3.1 Directory Tree

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── public/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css              ← Global styles / design tokens
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── EventCard.jsx      ← Card with compatibility score
│   │   ├── SearchBar.jsx      ← Skill-based filter
│   │   ├── SkillBadge.jsx     ← Reusable skill chip
│   │   └── ScoreRing.jsx      ← Circular % indicator
│   ├── pages/
│   │   ├── DiscoveryFeed.jsx  ← Main event listing
│   │   ├── Dashboard.jsx      ← Volunteer profile + stats
│   │   └── AdminPanel.jsx     ← Create event form + list
│   ├── services/
│   │   └── api.js             ← ALL API calls (single layer)
│   ├── utils/
│   │   └── matchUtils.js      ← Client-side matching logic
│   └── styles/
│       ├── components.css
│       └── pages.css
```

### 3.2 Pages & Components

| Page / Component | Description |
|---|---|
| **DiscoveryFeed** | Main page. Fetches events, computes compatibility per-event against current user's skills, renders `EventCard` grid. `SearchBar` at top for skill filtering. |
| **Dashboard** | Volunteer profile view: name, skills, total hours, list of matched events. |
| **AdminPanel** | Form to POST a new event + table of existing events. UI only — backend plugs in later. |
| **EventCard** | Rounded card: title, description, required skills as badges, `ScoreRing` for match %, register button. |
| **ScoreRing** | SVG circle progress indicator. Green ≥80%, Yellow 50-79%, Red <50%. |
| **SearchBar** | Text input that filters events by skill match on the client side. |
| **SkillBadge** | Pill component. Green = matched, gray = missing. |
| **Navbar** | Top nav with links to Discovery, Dashboard, Admin. |

### 3.3 API Layer — `services/api.js`

All components call this module; never call `fetch` directly from a component.

```js
const BASE_URL = "http://localhost:8080/api";  // ← backend team changes this

export const getEvents      = () => fetch(`${BASE_URL}/events`).then(r => r.json());
export const getEventById   = (id) => fetch(`${BASE_URL}/events/${id}`).then(r => r.json());
export const createEvent    = (data) => fetch(`${BASE_URL}/events`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) }).then(r => r.json());
export const getVolunteers  = () => fetch(`${BASE_URL}/volunteers`).then(r => r.json());
export const getVolunteer   = (id) => fetch(`${BASE_URL}/volunteers/${id}`).then(r => r.json());
```

While the backend is offline, `api.js` will return **mock data** via a `USE_MOCK` flag at the top of the file. Setting it to `false` switches to real API calls — zero changes needed in any component.

### 3.4 Mock Data Shape

```json
// Volunteer
{ "id": 1, "name": "Tarun M", "skills": "Java, React, Python", "hoursLogged": 42.5 }

// Event
{ "id": 1, "title": "Beach Cleanup", "requiredSkill": "Teamwork", "requiredVolunteers": 10, "currentVolunteers": 6 }
```

### 3.5 Compatibility Score (Client-Side)

Computed in `utils/matchUtils.js`:

```
matchPercentage = (matchedSkills.length / eventRequiredSkills.length) * 100
```

Returns `{ matchPercentage, matchedSkills, missingSkills }`. The backend can later add a dedicated `/api/match` endpoint; the frontend just swaps the call in `api.js`.

### 3.6 Color Coding

| Score Range | Color | CSS Variable |
|---|---|---|
| ≥ 80% | Green `#22c55e` | `--score-high` |
| 50–79% | Yellow `#eab308` | `--score-mid` |
| < 50% | Red `#ef4444` | `--score-low` |

---

## 4. Proposed Changes (Frontend)

### Vite + React Setup

#### [NEW] `frontend/package.json` — Vite + React, no extra frameworks
#### [NEW] `frontend/vite.config.js` — Dev server proxy to port 8080

---

### Design System

#### [NEW] `frontend/src/index.css` — CSS variables, global resets, design tokens
#### [NEW] `frontend/src/styles/components.css` — Card, badge, ring, navbar styles
#### [NEW] `frontend/src/styles/pages.css` — Page layouts (grid, dashboard)

---

### Core Components

#### [NEW] `frontend/src/components/Navbar.jsx`
#### [NEW] `frontend/src/components/EventCard.jsx`
#### [NEW] `frontend/src/components/SearchBar.jsx`
#### [NEW] `frontend/src/components/SkillBadge.jsx`
#### [NEW] `frontend/src/components/ScoreRing.jsx`

---

### Pages

#### [NEW] `frontend/src/pages/DiscoveryFeed.jsx`
#### [NEW] `frontend/src/pages/Dashboard.jsx`
#### [NEW] `frontend/src/pages/AdminPanel.jsx`

---

### API & Utilities

#### [NEW] `frontend/src/services/api.js` — Mock-capable API layer
#### [NEW] `frontend/src/utils/matchUtils.js` — Compatibility calculation

---

### Entry Points

#### [NEW] `frontend/src/main.jsx`
#### [NEW] `frontend/src/App.jsx` — Router: /, /dashboard, /admin
#### [NEW] `frontend/src/App.css`

---

## 5. Documentation (Frontend)

| File | Purpose |
|---|---|
| `frontend/API_CONTRACT.md` | Exact request/response shapes the backend must match |
| `frontend/COMPONENT_STRUCTURE.md` | Every component: purpose, props, data flow |
| `frontend/WORKFLOW.md` | User journey, page navigation, API flow |
| `frontend/DEVELOPMENT_LOG.md` | Timestamped log of every change |

---

## 6. Verification Plan

### Automated
- `npm run dev` — app starts on port 5173 without errors

### Visual (Browser)
1. Discovery Feed loads with mock event cards, each showing a compatibility score ring
2. Search bar filters events by skill keyword in real-time
3. Dashboard shows volunteer info and matched events
4. Admin panel form creates events (stored in local state)
5. All pages are responsive (mobile → desktop)
6. Score colors: green ≥80%, yellow 50-79%, red <50%
