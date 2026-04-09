# API Endpoint Tests

This file contains `curl` commands to test the API endpoints of the Service Matchmaker application. The commands are written for PowerShell.

## Volunteer Endpoints

### Get all volunteers

*   **Command:**
    ```powershell
    curl -Method GET http://localhost:8080/api/volunteers
    ```

*   **Expected Output (Success - 200 OK):**
    ```json
    [
        {
            "id": 1,
            "name": "John Doe",
            "skills": "Java, Spring Boot",
            "hoursLogged": 10
        },
        {
            "id": 2,
            "name": "Jane Smith",
            "skills": "JavaScript, React",
            "hoursLogged": 20
        }
    ]
    ```

### Get volunteer by ID

*   **Command:**
    ```powershell
    curl -Method GET http://localhost:8080/api/volunteers/1
    ```

*   **Expected Output (Success - 200 OK):**
    ```json
    {
        "id": 1,
        "name": "John Doe",
        "skills": "Java, Spring Boot",
        "hoursLogged": 10
    }
    ```

*   **Expected Output (Not Found - 404 Not Found):**
    ```
    (No output, just a 404 status code)
    ```

### Create a new volunteer

*   **Command:**
    ```powershell
    curl -Method POST -Uri http://localhost:8080/api/volunteers -Body '{"name": "Alice", "skills": "Python, Django", "hoursLogged": 0}' -Headers @{"Content-Type"="application/json"}
    ```

*   **Expected Output (Success - 200 OK):**
    ```json
    {
        "id": 3,
        "name": "Alice",
        "skills": "Python, Django",
        "hoursLogged": 0
    }
    ```

### Update a volunteer

*   **Command:**
    ```powershell
    curl -Method PUT -Uri http://localhost:8080/api/volunteers/1 -Body '{"name": "John Doe", "skills": "Java, Spring Boot, Hibernate", "hoursLogged": 15}' -Headers @{"Content-Type"="application/json"}
    ```

*   **Expected Output (Success - 200 OK):**
    ```json
    {
        "id": 1,
        "name": "John Doe",
        "skills": "Java, Spring Boot, Hibernate",
        "hoursLogged": 15
    }
    ```

### Delete a volunteer

*   **Command:**
    ```powershell
    curl -Method DELETE http://localhost:8080/api/volunteers/1
    ```

*   **Expected Output (Success - 200 OK):**
    ```
    (No output, just a 200 status code)
    ```

## Event Endpoints

### Get all events

*   **Command:**
    ```powershell
    curl -Method GET http://localhost:8080/api/events
    ```

*   **Expected Output (Success - 200 OK):**
    ```json
    [
        {
            "id": 1,
            "title": "Community Cleanup",
            "requiredSkill": "None",
            "requiredVolunteers": 10,
            "currentVolunteers": 5,
            "duration": 4,
            "status": "UPCOMING"
        },
        {
            "id": 2,
            "title": "Web Development Workshop",
            "requiredSkill": "JavaScript",
            "requiredVolunteers": 5,
            "currentVolunteers": 2,
            "duration": 6,
            "status": "UPCOMING"
        }
    ]
    ```

### Get event by ID

*   **Command:**
    ```powershell
    curl -Method GET http://localhost:8080/api/events/1
    ```

*   **Expected Output (Success - 200 OK):**
    ```json
    {
        "id": 1,
        "title": "Community Cleanup",
        "requiredSkill": "None",
        "requiredVolunteers": 10,
        "currentVolunteers": 5,
        "duration": 4,
        "status": "UPCOMING"
    }
    ```

### Create a new event

*   **Command:**
    ```powershell
    curl -Method POST -Uri http://localhost:8080/api/events -Body '{"title": "New Event", "requiredSkill": "Java", "requiredVolunteers": 5, "currentVolunteers": 0, "duration": 3, "status": "UPCOMING"}' -Headers @{"Content-Type"="application/json"}
    ```

*   **Expected Output (Success - 200 OK):**
    ```json
    {
        "id": 3,
        "title": "New Event",
        "requiredSkill": "Java",
        "requiredVolunteers": 5,
        "currentVolunteers": 0,
        "duration": 3,
        "status": "UPCOMING"
    }
    ```

### Update an event

*   **Command:**
    ```powershell
    curl -Method PUT -Uri http://localhost:8080/api/events/1 -Body '{"title": "Community Cleanup Day", "requiredSkill": "None", "requiredVolunteers": 15, "currentVolunteers": 5, "duration": 4, "status": "UPCOMING"}' -Headers @{"Content-Type"="application/json"}
    ```

*   **Expected Output (Success - 200 OK):**
    ```json
    {
        "id": 1,
        "title": "Community Cleanup Day",
        "requiredSkill": "None",
        "requiredVolunteers": 15,
        "currentVolunteers": 5,
        "duration": 4,
        "status": "UPCOMING"
    }
    ```

### Delete an event

*   **Command:**
    ```powershell
    curl -Method DELETE http://localhost:8080/api/events/1
    ```

*   **Expected Output (Success - 200 OK):**
    ```
    (No output, just a 200 status code)
    ```

## Action Endpoints

### Get matches for a volunteer

*   **Command:**
    ```powershell
    curl -Method GET http://localhost:8080/api/actions/match/1
    ```

*   **Expected Output (Success - 200 OK):**
    ```json
    [
        {
            "event": {
                "id": 1,
                "title": "Community Cleanup",
                "requiredSkill": "None",
                "requiredVolunteers": 10,
                "currentVolunteers": 5,
                "duration": 4,
                "status": "UPCOMING"
            },
            "compatibilityScore": 80
        },
        {
            "event": {
                "id": 2,
                "title": "Web Development Workshop",
                "requiredSkill": "JavaScript",
                "requiredVolunteers": 5,
                "currentVolunteers": 2,
                "duration": 6,
                "status": "UPCOMING"
            },
            "compatibilityScore": 25
        }
    ]
    ```

### Register a volunteer for an event

*   **Command:**
    ```powershell
    curl -Method POST http://localhost:8080/api/actions/register?volunteerId=1&eventId=1
    ```

*   **Expected Output (Success - 200 OK):**
    ```
    Successfully registered for the event.
    ```

### Complete an event

*   **Command:**
    ```powershell
    curl -Method POST http://localhost:8080/api/actions/complete/1
    ```

*   **Expected Output (Success - 200 OK):**
    ```
    Event completed successfully. Logged 4 hours for 6 volunteers.
    ```

## Auth Endpoints

### Register a new volunteer (Auth)

*   **Command:**
    ```powershell
    curl -Method POST -Uri http://localhost:8080/api/auth/register -Body '{"name": "Bob", "email": "bob@example.com", "password": "password123", "skills": "React", "hoursLogged": 0}' -Headers @{"Content-Type"="application/json"}
    ```

*   **Expected Output (Success - 200 OK):**
    ```json
    {
        "id": 4,
        "name": "Bob",
        "skills": "React",
        "hoursLogged": 0.0,
        "email": "bob@example.com",
        "password": "password123"
    }
    ```

### Login

*   **Command:**
    ```powershell
    curl -Method POST -Uri http://localhost:8080/api/auth/login -Body '{"email": "bob@example.com", "password": "password123"}' -Headers @{"Content-Type"="application/json"}
    ```

*   **Expected Output (Success - 200 OK):**
    ```json
    {
        "id": 4,
        "name": "Bob",
        "skills": "React",
        "hoursLogged": 0.0,
        "email": "bob@example.com",
        "password": "password123"
    }
    ```

*   **Expected Output (Unauthorized - 401 Unauthorized):**
    ```
    Invalid email or password.
    ```
