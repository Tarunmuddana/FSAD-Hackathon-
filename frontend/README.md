# Service Matchmaker Backend (Spring Boot)

This is the backend for the **Service Matchmaker** platform, a system designed to seamlessly connect volunteers with community service events. Built with Spring Boot and MySQL, it goes beyond simple event booking by incorporating engagement drivers like compatibility scoring and gamified impact tracking.

---

## 🌟 Core Features

1. **Smart Compatibility Engine**: Volunteers are automatically matched with events based on their skill sets. Events are returned with a `compatibilityScore` (100% for perfect match, 80% for general events, 25% for partial matches).
2. **Impact Tracker (Gamification)**: A system built to increase volunteer retention. When an event is marked as `COMPLETED`, the system automatically credits the event's duration to the total `hoursLogged` of every registered volunteer.
3. **Local Authentication**: Simple `/api/auth/register` and `/api/auth/login` endpoints to manage users.
4. **CRUD Management**: Complete REST APIs to manage `Volunteers` and `Events`.

---

## 🏗️ Architecture & Database

This project uses Spring Data JPA with a MySQL database (`service_matchmaker`).

### Key Entities:
*   **Volunteer**: Stores user profile (`name`, `email`, `password`, `skills`, `hoursLogged`).
*   **Event**: Stores event details (`title`, `requiredSkill`, `duration`, `requiredVolunteers`, `currentVolunteers`, `status`).
*   **Registration**: A mapping table securely linking a `Volunteer` to an `Event`.

---

## 🚀 Setup & Running Locally

### Prerequisites
*   Java 17+
*   MySQL Server (running on port 3306)
*   Maven

### Steps
1. **Database Setup**: Open MySQL and create the database:
   ```sql
   CREATE DATABASE service_matchmaker;
   ```
   *(Note: The application properties are configured to automatically create this database if it doesn't exist, provided your MySQL credentials are correct).*

2. **Configure Credentials**: Check `src/main/resources/application.properties` to ensure your MySQL username and password match your local setup:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=8466
   ```

3. **Run the Application**:
   Navigate to the project root and run:
   ```bash
   mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

---

## 🔐 How to Use Auth (Frontend Guide)

The backend provides a lightweight local authentication system perfect for hackathons. It avoids the heavy setup of JWTs while still demonstrating full user flow architecture.

### 1. Register a User
Create a form in React that collects `name`, `email`, `password`, and `skills`. Send this to the backend:

```javascript
// POST to /api/auth/register
const registerData = {
    name: "John Doe",
    email: "john@example.com",
    password: "securepassword123",
    skills: "React, Java",
    hoursLogged: 0 // Always start at 0
};

fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerData)
})
.then(response => response.json())
.then(user => console.log("Registered:", user));
```

### 2. Login a User
Create a login page that posts just the email and password:

```javascript
// POST to /api/auth/login
const loginCredentials = {
    email: "john@example.com",
    password: "securepassword123"
};

fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginCredentials)
})
.then(response => {
    if (!response.ok) throw new Error("Invalid credentials");
    return response.json();
})
.then(user => {
    // 💡 MAGIC HAPPENS HERE: 
    // Save this 'user' object to React State, Context, or LocalStorage
    localStorage.setItem("currentUser", JSON.stringify(user));
    console.log("Logged In Successfully!", user);
});
```

### 3. Maintain Session
Whenever your React app loads, check `localStorage`:
```javascript
const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
if (loggedInUser) {
    // User is logged in! Use loggedInUser.id for actions like registering for events
}
```

---

## 🧪 API Documentation
Detailed endpoint testing commands (for PowerShell/cURL) and expected JSON responses can be found in the attached [`api_tests.md`](./api_tests.md) file.
