# Grafide — Graphics Design Learning Platform

## Project Structure

```
grafide/
├── frontend/               # HTML, CSS, JS
│   ├── index.html          # Homepage
│   ├── css/
│   │   └── main.css        # All styles (responsive)
│   ├── js/
│   │   └── main.js         # Auth, course logic, progress
│   └── pages/
│       └── course.html     # Course + lesson page
│
└── backend/                # Spring Boot (Java 17)
    ├── pom.xml
    └── src/main/
        ├── java/com/grafide/
        │   ├── GrafideApplication.java
        │   ├── config/
        │   │   └── SecurityConfig.java
        │   ├── controller/
        │   │   ├── AuthController.java
        │   │   ├── CertificateController.java
        │   │   ├── CourseController.java
        │   │   ├── NewsletterController.java
        │   │   └── ProgressController.java
        │   ├── model/
        │   │   ├── Certificate.java
        │   │   ├── Course.java
        │   │   ├── Progress.java
        │   │   └── User.java
        │   ├── repository/
        │   │   ├── CertificateRepository.java
        │   │   ├── CourseRepository.java
        │   │   ├── ProgressRepository.java
        │   │   └── UserRepository.java
        │   └── security/
        │       ├── JwtAuthFilter.java
        │       └── JwtUtil.java
        └── resources/
            └── application.properties
```

---

## Setup

> Note: Backend package structure and JWT security import were fixed so Spring Boot can scan controllers and filters correctly.

### Prerequisites
- Java 17+
- Maven 3.8+
- MongoDB running locally on port 27017
- A modern browser (for frontend)

---

### 1. Backend

```bash
cd grafide/backend
```

**Set your JWT secret** in `src/main/resources/application.properties`:
```
grafide.jwt.secret=REPLACE_WITH_A_LONG_RANDOM_SECRET_KEY_MIN_256_BITS
```
Generate one: `openssl rand -base64 64`

**Run:**
```bash
mvn spring-boot:run
```
Backend starts at `http://localhost:8080`

---

### 2. Frontend

Open `frontend/index.html` with Live Server (VS Code extension) or any static server:
```bash

python -m http.server 5500
```

---

### 3. MongoDB

Local (default):
```
mongodb://localhost:27017/grafide
```
http://127.0.0.1:5500

Cloud (MongoDB Atlas) — swap the URI in `application.properties`:
```
spring.data.mongodb.uri=mongodb+srv://<user>:<pass>@cluster.mongodb.net/grafide
```

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |

### Courses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/courses` | Public | All published courses |
| GET | `/api/courses/{slug}` | Public | Course by slug |
| POST | `/api/courses` | Admin | Create course |
| PUT | `/api/courses/{id}` | Admin | Update course |
| DELETE | `/api/courses/{id}` | Admin | Delete course |

### Progress
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/progress` | Student | All my progress |
| GET | `/api/progress/{courseId}` | Student | Progress for course |
| POST | `/api/progress/complete` | Student | Mark lesson complete |

### Certificates
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/certificates/issue` | Student | Issue cert after completion |
| GET | `/api/certificates/mine` | Student | My certificates |
| GET | `/api/certificates/verify/{id}` | Public | Verify a certificate |

---

## Course Slugs
- `coreldraw`
- `photoshop`
- `illustrator`
- `msword`
- `canva`

---

## Adding Course Content (Admin)

POST to `/api/courses` with your admin JWT:

```json
{
  "slug": "photoshop",
  "name": "Photoshop",
  "tagline": "Creating Designs Via Photoshop",
  "category": "Photo Editing",
  "published": true,
  "levels": [
    {
      "name": "Beginner",
      "order": 0,
      "lessons": [
        {
          "title": "Introduction to Photoshop",
          "order": 0,
          "content": "<p>Your writeup HTML here...</p>",
          "videoUrl": "https://www.youtube.com/watch?v=EXAMPLE",
          "resources": [
            {
              "title": "Adobe Photoshop Docs",
              "url": "https://helpx.adobe.com/photoshop/",
              "type": "reference"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Architecture Notes — Tutor Mode (Phase 2)

The database schema is already tutor-ready:
- `User.role` supports `STUDENT | TUTOR | ADMIN`
- `User.tutorApproved` flag for admin approval workflow
- `Course.createdBy`, `createdByName`, `createdByRole` tracks content ownership
- `/api/courses/submit` endpoint stub exists for tutor submissions
- Security routes `/api/tutor/**` already configured

To activate tutor mode: flip a user's role to `TUTOR` in MongoDB, build the tutor dashboard UI, wire it to `/api/courses/submit`.

---

## Certificate Verification

Every certificate gets a unique ID in format: `GRF-{COURSE}-{8_CHAR_UUID}`

Example: `GRF-PHOTOSHOP-A3F9C2B1`

Verifiable at: `https://grafide.com/verify/GRF-PHOTOSHOP-A3F9C2B1`

The `/api/certificates/verify/{id}` endpoint is public — anyone with the ID can check it.


Working locally → keep the API_BASE_URL: 'http://localhost:8080/api' line active (as it is now)
Deploying to Render → before you push, comment out the localhost line and uncomment the Render line, so:

javascript// API_BASE_URL: 'http://localhost:8080/api',
API_BASE_URL: 'https://grafide-graphics-backend.onrender.com/api',