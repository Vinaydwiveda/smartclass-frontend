# Smart Classroom Attendance System

This is a full-stack web application designed for automated classroom attendance tracking using face recognition technology. The system leverages AI models for real-time face detection and recognition to mark student attendance, with data stored in a MongoDB database and synced to Google Sheets via n8n workflows.

## Features

- **Face Recognition Attendance**: Uses the webcam to detect and recognize student faces, marking attendance in real-time.
- **Student Management**: Register new students with face embeddings stored in the backend.
- **Attendance Tracking**: Day-wise attendance records with duplicate prevention, stored locally in Redux and synced to the backend.
- **Reports Dashboard**: Visualize attendance data using charts (via Recharts).
- **Integration with Google Sheets**: Automatically submits attendance data to n8n webhook for updating external spreadsheets.
- **Teacher Dashboard**: Overview of attendance, reports, and student lists.
- **Responsive UI**: Built with React, Tailwind CSS, and modern design principles.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **AI/ML**: face-api.js models (TINY_FACE_DETECTOR, FACE_LANDMARK_68, FACE_RECOGNITION_NET)
- **File Upload**: Multer for handling student images
- **Automation**: n8n integration for Google Sheets syncing
- **Other**: CORS, dotenv for environment variables

### Frontend
- **Framework**: React (with Vite for fast development)
- **State Management**: Redux Toolkit
- **UI/Styling**: Tailwind CSS
- **Routing**: React Router
- **AI/ML**: face-api.js and TensorFlow.js (WebGL backend)
- **Charts**: Recharts for attendance reports
- **HTTP Client**: Axios
- **Icons**: React Icons

### Models
Pre-trained face-api.js models are included in both backend (`backend/models/`) and frontend (`frontend/my-project/public/models/`) for face detection, landmarks, recognition, age/gender estimation, and expression analysis.

## Project Structure

```
project3/
├── backend/                  # Node.js/Express API server
│   ├── src/
│   │   ├── config/db.js      # MongoDB connection
│   │   ├── models/           # Mongoose schemas (Student, Attendance)
│   │   ├── routes/           # API routes (e.g., student.js for attendance marking)
│   │   ├── utils/n8n.js      # n8n webhook utilities
│   │   └── index.js          # Server entry point
│   ├── models/               # AI model files
│   ├── uploads/              # Student images and embeddings
│   ├── package.json          # Backend dependencies
│   └── ...                   # Other config files
├── frontend/                 # React frontend
│   └── my-project/           # Vite React app
│       ├── public/           # Static assets, including AI models
│       ├── src/
│       │   ├── components/   # Reusable UI (e.g., Navbar.jsx)
│       │   ├── features/     # Redux slices (e.g., attendanceSlice.js)
│       │   ├── pages/        # Main views (Attendance.jsx, TeacherDashboard.jsx, etc.)
│       │   ├── api.js        # API client and n8n functions
│       │   ├── store.js      # Redux store configuration
│       │   ├── App.jsx       # Root component with routing
│       │   └── main.jsx      # Entry point with Provider
│       ├── package.json      # Frontend dependencies
│       └── ...               # Vite config, ESLint, etc.
├── TODO.md                   # Task tracking for development
└── README.md                 # This file
```

## Prerequisites

- Node.js (v18+)
- MongoDB (local or cloud, e.g., MongoDB Atlas)
- Webcam for face recognition testing
- n8n instance (self-hosted or cloud) with a webhook for Google Sheets integration

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in `backend/` with the following (update values as needed):
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smart_classroom
   # Or use MongoDB Atlas URI
   ```
4. Start the server:
   ```
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend/my-project
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (Vite default). It proxies API calls to the backend via `/api`.

### 3. Database Setup
- Ensure MongoDB is running.
- The backend connects automatically via `db.js`.
- Collections: `students` (with face embeddings) and `attendance`.

### 4. n8n Integration
- Set up an n8n workflow with a webhook trigger (e.g., `https://your-n8n-instance/webhook/mark-attendance`).
- The workflow should receive POST data with `students` array and update Google Sheets.
- Update the webhook URL in `frontend/my-project/src/api.js` if needed.

### 5. Student Registration
- Use the StudentRegister page to upload student photos.
- Face embeddings are generated and stored in the backend.
- Ensure models are loaded correctly for recognition.

## Usage

1. Start both backend and frontend servers.
2. Access the app at `http://localhost:5173`.
3. Navigate to **Attendance** page: Grant camera access, and the system will detect faces and mark attendance.
4. View **Teacher Dashboard** for reports and summaries.
5. Attendance data syncs to n8n/Google Sheets automatically.

## API Endpoints

- `POST /api/students/register`: Register a new student with photo (multipart form).
- `POST /api/students/attendance/mark`: Mark attendance by sending face embedding.
- Backend serves models at `/models/*` for frontend loading.

## Development Notes

- **Models**: Ensure all shard files and manifests are present for face-api.js to load correctly.
- **Proxy**: Frontend uses Axios with `baseURL: '/api'`; Vite proxies to backend (configure in `vite.config.js` if ports differ).
- **Local Storage Fallback**: Attendance uses Redux with localStorage backup for offline resilience.
- **Security**: In production, secure the backend with authentication (e.g., JWT for teachers) and HTTPS.
- **Testing**: Test face recognition in a well-lit environment; adjust detection thresholds in `Attendance.jsx` if needed.

## Troubleshooting

- **Models Not Loading**: Verify model files in `public/models/` and server accessibility.
- **Camera Issues**: Check browser permissions; use HTTPS for getUserMedia in production.
- **CORS Errors**: Ensure backend CORS is configured for frontend origin.
- **n8n Failures**: Check console logs; verify webhook URL and n8n workflow.
- **MongoDB Connection**: Update `MONGODB_URI` in `.env`; test with MongoDB Compass.

## Contributing

1. Fork/clone the project.
2. Create a feature branch.
3. Update `TODO.md` for new tasks.
4. Commit changes and test thoroughly.
5. Push and create a pull request.

## License

This project is open-source under the MIT License.

---

For questions or issues, refer to the code or open an issue.
