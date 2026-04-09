# API Contract

> **For the Backend Team:** the frontend calls these exact URLs. `USE_MOCK = true` is set in `api.js` during development — set it to `false` to route requests to the real Spring Boot server on `http://localhost:8080`.

---

## Base URL
```
http://localhost:8080/api
```

---

## Auth Endpoints

### `POST /api/auth/register`
**Body:**
```json
{ "name": "Bob", "email": "bob@example.com", "password": "password123", "skills": "React", "hoursLogged": 0 }
```
**Returns:** Full Volunteer object (see shape below).

---

### `POST /api/auth/login`
**Body:**
```json
{ "email": "bob@example.com", "password": "password123" }
```
**Returns (200):** Full Volunteer object.  
**Returns (401):** Plain text `"Invalid email or password."`

---

## Volunteer Endpoints

### `GET /api/volunteers`
Returns array of Volunteer objects.

### `GET /api/volunteers/:id`
Returns single Volunteer or 404.

### `POST /api/volunteers`
**Body:** `{ name, skills, hoursLogged }`

### `PUT /api/volunteers/:id`
**Body:** Full Volunteer object.

### `DELETE /api/volunteers/:id`
Returns 200 with no body.

---

## Event Endpoints

### `GET /api/events`
Returns array of Event objects.

### `GET /api/events/:id`
Returns single Event or 404.

### `POST /api/events`
**Body:** `{ title, description, requiredSkill, requiredVolunteers, duration, status }`

### `PUT /api/events/:id`
Full Event object.

### `DELETE /api/events/:id`
Returns 200.

---

## Action Endpoints

### `GET /api/actions/match/:volunteerId`
Returns array of `{ event: EventObject, compatibilityScore: number }`.

### `POST /api/actions/register?volunteerId=&eventId=`
Returns plain text: `"Successfully registered for the event."`

### `POST /api/actions/complete/:eventId`
Returns plain text: `"Event completed successfully. Logged X hours for Y volunteers."`

---

## Object Shapes

### Volunteer
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "...",
  "skills": "Java, Spring Boot",
  "hoursLogged": 10.0
}
```

### Event
```json
{
  "id": 1,
  "title": "Community Cleanup",
  "description": "Help clean the park.",
  "requiredSkill": "Teamwork",
  "requiredVolunteers": 10,
  "currentVolunteers": 5,
  "duration": 4,
  "status": "UPCOMING"
}
```
