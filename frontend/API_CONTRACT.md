# API Contract

## Base URL
`/api`

## Endpoints

### Events
- `GET /events`
  - Returns: Array of Event objects
- `GET /events/:id`
  - Returns: Single Event object
- `POST /events`
  - Body: `{ title, description, requiredSkill, requiredVolunteers }`
  - Returns: Created Event object

### Volunteers
- `GET /volunteers`
  - Returns: Array of Volunteer objects
- `GET /volunteers/:id`
  - Returns: Single Volunteer object

## Object Shapes

### Event
```json
{
  "id": 1,
  "title": "String",
  "description": "String",
  "requiredSkill": "Comma, separated, strings",
  "requiredVolunteers": 10,
  "currentVolunteers": 6
}
```

### Volunteer
```json
{
  "id": 1,
  "name": "String",
  "skills": "Comma, separated, strings",
  "hoursLogged": 42.5
}
```
