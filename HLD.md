# High-Level Design (HLD) - Smart Classroom Attendance System

## 1. Introduction

### 1.1 Purpose
This High-Level Design document outlines the architecture of the Smart Classroom Attendance System, a web-based application that automates attendance tracking using face recognition technology. The system enables teachers to mark student attendance via webcam in real-time, stores data in a database, and integrates with external tools like Google Sheets for reporting.

### 1.2 Scope
- **Core Functionality**: Face detection/recognition, attendance marking, student registration, reporting.
- **Users**: Teachers (dashboard access), Students (implicit via recognition).
- **Non-Functional**: Real-time processing, responsive UI, secure data handling.
- **Out of Scope**: Advanced analytics, mobile app, multi-class support.

### 1.3 Assumptions and Constraints
- **Assumptions**:
  - Webcam access granted in browser.
  - Well-lit environment for accurate face recognition.
  - MongoDB instance available (local or cloud).
  - n8n webhook accessible for integrations.
- **Constraints**:
  - Browser-based (no native app).
  - Face-api.js models pre-loaded; no custom training.
  - Single-user mode (teacher-only access).

## 2. System Overview

The system is a client-server architecture with:
- **Frontend**: React app for UI, camera access, and face processing.
- **Backend**: Node.js/Express API for data persistence and embedding matching.
- **Database**: MongoDB for students and attendance records.
- **External Services**: n8n for Google Sheets sync; TensorFlow.js/face-api.js for ML.

High-level flow:
1. Teacher starts camera on Attendance page.
2. Frontend detects face, generates embedding.
3. Sends embedding to backend for matching.
4. Backend queries DB, marks attendance if match found.
5. Frontend updates local state (Redux), syncs to n8n.

### 2.1 Architecture Diagram (Text-Based)
```
[User (Teacher)] --> [Browser (Frontend: React/Vite)]
                     |
                     | (Webcam Access + face-api.js)
                     v
[Face Embedding] --> [HTTP API Calls (Axios)] --> [Backend: Node.js/Express]
                                                       |
                                                       | (Multer for uploads, Mongoose for DB)
                                                       v
[Student/Attendance DB (MongoDB)] <--> [Query/Match Embeddings]
                                                       |
                                                       | (Optional: n8n Webhook)
                                                       v
[External: Google Sheets via n8n]
```

## 3. Components

### 3.1 Frontend (React + Vite)
- **Purpose**: User interface, real-time face recognition, state management.
- **Key Modules**:
  - **Pages**:
    - `Attendance.jsx`: Camera stream, face detection (TinyFaceDetector), landmark extraction, descriptor generation. Dispatches to Redux on match.
    - `TeacherDashboard.jsx`: Overview, reports (Recharts for charts).
    - `StudentRegister.jsx`: Upload student photo, generate/store embedding via API.
    - `Home.jsx`, `Reports.jsx`: Navigation and summaries.
  - **Components**: `Navbar.jsx` for routing (React Router).
  - **State Management**: Redux Toolkit (`store.js`, `attendanceSlice.js`) for attendance data with localStorage fallback.
  - **API Layer**: `api.js` - Axios client (proxied to `/api`), `sendAttendanceToN8n` for webhook.
  - **ML Integration**: face-api.js with TensorFlow.js (WebGL backend). Loads models from `/public/models/`.
- **Technologies**: React 19, Tailwind CSS, Recharts, React Icons, Redux Toolkit.
- **Build/Dev**: Vite for HMR, ESLint for linting.

### 3.2 Backend (Node.js + Express)
- **Purpose**: API server, database operations, embedding storage/matching.
- **Key Modules**:
  - **Server Entry**: `src/index.js` - Express app setup, CORS, routes mounting, model serving.
  - **Config**: `src/config/db.js` - MongoDB connection (dotenv for URI).
  - **Models** (Mongoose Schemas):
    - `src/models/Student.js`: Fields - name, rollNo, embedding (array of 128 floats from face descriptor).
    - `src/models/Attendance.js`: Fields - studentId, date, status, timestamp.
  - **Routes**: `src/routes/student.js` - Endpoints for register (`POST /students/register`), mark attendance (`POST /students/attendance/mark` - computes cosine similarity for matching).
  - **Utils**: `src/utils/n8n.js` - Optional helper for n8n calls (though frontend handles primary sync).
  - **File Handling**: Multer for photo uploads in registration; stores in `/uploads/`.
  - **ML Models**: Serves face-api.js models from `/models/` for frontend; backend may use for server-side if needed.
- **Technologies**: Express 4, Mongoose 7, Multer, Axios (for any external calls), Nodemon for dev.
- **Security**: Basic CORS; add JWT/auth in production.

### 3.3 Database (MongoDB)
- **Schema**:
  - **Students Collection**: `{ _id, name: String, rollNo: String, embedding: [Number] }`
  - **Attendance Collection**: `{ _id, studentId: ObjectId, date: Date, status: String, timestamp: Date }`
- **Operations**:
  - Insert student with embedding on registration.
  - Query students by embedding similarity (cosine distance < threshold, e.g., 0.6).
  - Insert attendance record on match.
- **Indexing**: On rollNo, date for queries.

### 3.4 External Integrations
- **n8n**: Webhook (`POST /webhook/mark-attendance`) receives attendance array, updates Google Sheets. Called from frontend on state change.
- **face-api.js Models**: Pre-trained (TinyFaceDetector, FaceLandmark68Net, FaceRecognitionNet). Shards in both frontend/backend for redundancy.

## 4. Data Flow

### 4.1 Attendance Marking
1. Frontend: Load models → Start video → Detect face (every 1s) → Extract descriptor (128D vector).
2. API Call: POST `/api/students/attendance/mark` with `{ embedding }`.
3. Backend: Compute similarity to all students (cosine sim); if match (threshold), create Attendance doc, return student info.
4. Frontend: Dispatch `markAttendance` to Redux → If new entries, POST to n8n webhook.
5. n8n: Parse students array → Append to Google Sheet (columns: Name, RollNo, Date, Status).

### 4.2 Student Registration
1. Frontend: Upload photo → Generate embedding client-side.
2. API Call: POST `/api/students/register` with form-data (photo/embedding).
3. Backend: Validate, store embedding in Student doc, save photo to `/uploads/`.

### 4.3 Reporting
1. Frontend: Query backend for attendance data (e.g., GET `/api/attendance?date=...` - not implemented yet).
2. Render charts in TeacherDashboard (e.g., attendance rate pie chart).

## 5. Non-Functional Aspects

### 5.1 Performance
- **Latency**: Face detection ~100ms/frame; embedding match O(n) for small n (students < 100).
- **Scalability**: MongoDB scales horizontally; for large classes, use vector DB (e.g., Pinecone) for embeddings.
- **Offline**: Redux + localStorage for temp storage; sync on reconnect.

### 5.2 Security
- **Data**: Embeddings anonymized; no raw photos stored post-registration.
- **Access**: Teacher-only (add login); HTTPS required.
- **Privacy**: GDPR-compliant; inform users of camera use.

### 5.3 Reliability
- **Error Handling**: Fallbacks for model load/camera errors; retry on API fails.
- **Monitoring**: Console logs; add Winston for production.

## 6. Deployment Considerations
- **Hosting**: Backend on Heroku/Vercel; Frontend on Netlify/Vercel (static).
- **Environment**: `.env` for secrets (MONGODB_URI, N8N_WEBHOOK).
- **CI/CD**: GitHub Actions for build/test/deploy.
- **Models Serving**: CDN for large model files.

## 7. Risks and Mitigations
- **Risk**: Poor lighting/false positives → Mitigation: UI prompts, adjustable thresholds.
- **Risk**: Model size (large downloads) → Mitigation: Lazy-load, compress shards.
- **Risk**: n8n downtime → Mitigation: Queue failed syncs, retry mechanism.

## 8. Future Enhancements
- Server-side face recognition for batch processing.
- Multi-teacher support with auth.
- Mobile responsiveness for tablets.
- Integration with LMS (e.g., Google Classroom).

---

Document Version: 1.0  
Date: [Current Date]  
Author: BLACKBOXAI
