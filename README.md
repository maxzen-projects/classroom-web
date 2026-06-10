# 📌 Classroom Learning Management System (LMS)

**Version**: 1.2.0

---

## 📖 Description

**Classroom LMS** is a comprehensive, full-featured Learning Management System designed for educational institutions of all sizes. The platform enables teachers to create and manage courses with rich multimedia content, while students can enroll, access materials, track progress, and participate in live interactive classes.

**Purpose**: To provide a seamless, scalable solution for delivering online education with features like course management, real-time collaboration, assignment tracking, and student analytics.

**Architecture**: 
- **Backend**: Node.js + Express with MongoDB for API services and data management
- **Frontend**: React + Redux with Vite for a responsive, fast user interface
- **Real-time**: Socket.IO for live class interactions and notifications
- **Storage**: Local file uploads with support for cloud services (Cloudinary/AWS S3)

---

## ✨ Features

### 👨‍🏫 For Teachers
- ✅ Create and manage courses with organized subjects, chapters, and topics
- ✅ Upload video lessons and study materials with automatic thumbnail generation
- ✅ Schedule and conduct live classes with real-time student interaction
- ✅ Create assignments and quizzes with file submission tracking
- ✅ View student progress, submissions, and performance analytics
- ✅ Manage classroom enrollments and send notifications
- ✅ Track attendance and generate performance reports

### 👨‍🎓 For Students
- ✅ Browse and enroll in courses with detailed preview information
- ✅ Access video lessons, notes, and study materials seamlessly
- ✅ Attend live classes with real-time chat and interaction
- ✅ Submit assignments and download feedback from teachers
- ✅ Track learning progress with visual indicators and completion status
- ✅ Receive notifications about new assignments and class announcements

### 🏫 For Administrators
- ✅ Manage schools, classes, and user roles (admin, teacher, student)
- ✅ Oversee all courses and monitor platform usage
- ✅ Generate system-wide reports and analytics
- ✅ Manage user accounts and permissions

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend** | Node.js, Express.js | Latest |
| **Frontend** | React, Redux Toolkit, RTK Query | v18+ |
| **Database** | MongoDB | v7.5+ |
| **Build Tools** | Vite, Babel | Latest |
| **Real-time** | Socket.IO | v4.7.2 |
| **Authentication** | JWT (JSON Web Tokens) | - |
| **File Upload** | express-fileupload, Multer | Latest |
| **Security** | Helmet, CORS, bcryptjs | Latest |
| **Styling** | Tailwind CSS, PostCSS | Latest |
| **HTTP Client** | RTK Query, Axios | Latest |

**Optional Integrations**:
- 🖼️ **Cloudinary** or **AWS S3** - Cloud file storage
- 📧 **Nodemailer** - Email notifications
- 🎥 **Google Meet** - External live class integration

---

## 📁 Project Structure

```
classroom/
│
├── backend/                          # Node.js + Express backend server
│   ├── config/
│   │   └── database.js              # MongoDB connection configuration
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT token verification
│   │   ├── roleMiddleware.js        # Role-based access control (RBAC)
│   │   └── errorHandler.js          # Global error handling middleware
│   │
│   ├── models/                       # MongoDB schemas and models
│   │   ├── User.js                  # User (admin, teacher, student)
│   │   ├── Course.js                # Course structure
│   │   ├── Subject.js               # Subject within a course
│   │   ├── Chapter.js               # Chapter within a subject
│   │   ├── Topic.js                 # Topic within a chapter
│   │   ├── Lesson.js                # Video/text lessons
│   │   ├── Assignment.js            # Teacher-created assignments
│   │   ├── Submission.js            # Student submissions
│   │   ├── Test.js                  # Quizzes and tests
│   │   ├── LiveClass.js             # Live class sessions
│   │   ├── Attendance.js            # Attendance tracking
│   │   ├── Analytics.js             # User activity analytics
│   │   ├── Result.js                # Test results and grades
│   │   ├── Fee.js                   # Fee management
│   │   ├── Class.js                 # Classroom (grade/section)
│   │   ├── Classroom.js             # Classroom management
│   │   ├── School.js                # School/Institution
│   │   ├── Notification.js          # User notifications
│   │   ├── SubjectAssignment.js     # Subject-Teacher mapping
│   │   ├── Schedule.js              # Class schedule
│   │   ├── Question.js              # Quiz questions
│   │   └── Lab.js / Batch.js        # Additional structures (if used)
│   │
│   ├── routes/                       # Express route handlers
│   │   ├── auth.js                  # Authentication (register, login, profile)
│   │   ├── courses.js               # Course CRUD operations
│   │   ├── subjects.js              # Subject management
│   │   ├── chapters.js              # Chapter management
│   │   ├── topics.js                # Topic management
│   │   ├── lessons.js               # Lesson upload and access
│   │   ├── students.js              # Student management
│   │   ├── teachers.js              # Teacher management
│   │   ├── classes.js               # Class management
│   │   ├── assignment.js            # Assignment CRUD and submission
│   │   ├── submission.js            # Assignment submission handling
│   │   ├── liveClasses.js           # Live class scheduling and management
│   │   ├── admin.js                 # Admin dashboard and management
│   │   ├── superAdmin.js            # Super admin operations
│   │   ├── schools.js               # School management
│   │   ├── subjectAssignments.js    # Subject-teacher assignment
│   │   ├── classroom.js             # Classroom operations
│   │   └── <other-routes>           # Other feature routes
│   │
│   ├── sockets/
│   │   └── socketHandler.js         # Socket.IO event handling for real-time features
│   │
│   ├── utils/
│   │   ├── logger.js                # Winston logging utility
│   │   ├── upload.js                # File upload helper functions
│   │   └── generateCode.js          # Code generation utilities
│   │
│   ├── uploads/                      # Local file storage (temporary)
│   │   ├── lessons/                 # Video/lesson files
│   │   ├── profiles/                # User profile pictures
│   │   ├── resumes/                 # Teacher resumes
│   │   └── thumbnails/              # Course thumbnails
│   │
│   ├── logs/                         # Application logs
│   │
│   ├── server.js                     # Main application entry point
│   ├── package.json                  # Node dependencies
│   └── .env                          # Environment variables
│
├── frontend/                         # React + Vite frontend
│   ├── src/
│   │   ├── components/               # Reusable React components
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   ├── Sidebar.jsx           # Left navigation sidebar
│   │   │   ├── Modal.jsx             # Generic modal component
│   │   │   ├── Loader.jsx            # Loading spinner
│   │   │   ├── Toast.jsx             # Toast notifications
│   │   │   ├── ProtectedRoute.jsx    # Auth protection wrapper
│   │   │   ├── RoleProtectedRoute.jsx# Role-based access control
│   │   │   ├── Pagination.jsx        # Pagination control
│   │   │   ├── SearchBar.jsx         # Search functionality
│   │   │   ├── EmptyState.jsx        # Empty result state
│   │   │   ├── DashboardCard.jsx     # Dashboard stat card
│   │   │   ├── CreateStudentModal.jsx# Student creation form
│   │   │   ├── CreateTeacherModal.jsx# Teacher creation form
│   │   │   ├── CreateClassModal.jsx  # Class creation form
│   │   │   ├── AssignmentCard.jsx    # Assignment display card
│   │   │   ├── AddSubjectModal.jsx   # Subject creation/edit form
│   │   │   ├── LiveClassFormModal.jsx# Live class scheduling form
│   │   │   ├── SubmissionForm.jsx    # Assignment submission form
│   │   │   ├── AttendanceModal.jsx   # Attendance marking modal
│   │   │   └── <other-components>   # Additional features
│   │
│   ├── pages/                        # Full-page components
│   │   ├── AdminDashboard.jsx        # Admin overview page
│   │   ├── AdminManageStudents.jsx   # Student management page
│   │   ├── AdminManageTeachers.jsx   # Teacher management page
│   │   ├── AdminManageCourses.jsx    # Course management page
│   │   ├── AdminManageLiveClasses.jsx# Live class management
│   │   ├── TeacherDashboard.jsx      # Teacher overview
│   │   ├── StudentDashboard.jsx      # Student overview
│   │   ├── CourseDetail.jsx          # Course details page
│   │   ├── ManageSubjects.jsx        # Subject management
│   │   └── <other-pages>            # More page components
│   │
│   ├── redux/                        # Redux store and RTK Query APIs
│   │   ├── store.js                  # Redux store configuration
│   │   ├── baseApi.js                # RTK Query base configuration
│   │   ├── authApi.js                # Auth API slice
│   │   ├── courseApi.js              # Courses API slice
│   │   ├── studentsApi.js            # Students API slice
│   │   ├── teachersApi.js            # Teachers API slice
│   │   ├── classApi.js               # Classes API slice
│   │   ├── classesApi.js             # Additional class APIs
│   │   ├── subjectsApi.js            # Subjects API slice
│   │   ├── coursesApi.js             # Course APIs
│   │   ├── assignmentApi.js          # Assignment APIs
│   │   └── <other-slices>           # Additional API slices
│   │
│   ├── context/
│   │   └── AuthContext.jsx           # Global auth context (backup to Redux)
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx            # Main layout wrapper
│   │
│   ├── routes/                       # Frontend routing
│   │   └── AppRoutes.jsx             # Route definitions
│   │
│   ├── services/                     # API service functions (if not using RTK Query)
│   │
│   ├── utils/                        # Utility functions
│   │   ├── helpers.js                # General helpers
│   │   ├── validators.js             # Form validation
│   │   └── constants.js              # App constants
│   │
│   ├── assets/                       # Static assets
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── App.jsx                       # Root component
│   ├── index.css                     # Global styles
│   ├── main.jsx                      # React entry point
│   ├── index.html                    # HTML template
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS config
│   ├── package.json                  # Dependencies
│   └── README.md                     # Frontend docs
│
├── VALIDATION_DOCUMENTATION.md       # API validation schema docs
└── README.md                         # This file
```

---

## 📂 File Usage Details

### Backend Core Files

#### `backend/server.js`
**Purpose**: Application entry point and Express server setup.

**Key Responsibilities**:
- Initialize Express app with middleware (CORS, helmet, compression)
- Mount all API routes under `/api` prefix
- Configure Socket.IO for real-time features
- Connect to MongoDB
- Start HTTP server on configured PORT (default: 5000)
- Setup error handling and 404 routes

**Execution**: Runs on `npm run dev` or `npm start`

**Example**:
```javascript
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

#### `backend/config/database.js`
**Purpose**: MongoDB connection setup and management.

**Key Responsibilities**:
- Connect to MongoDB using Mongoose
- Handle connection errors
- Set connection options (retry, pooling, etc.)
- Log connection status

**Usage**: Called in `server.js` before starting server.

---

#### `backend/middleware/authMiddleware.js`
**Purpose**: JWT token verification and user authentication.

**Key Responsibilities**:
- Extract JWT from request headers
- Verify token validity using `JWT_SECRET`
- Attach authenticated user to `req.user`
- Return 401 if token is missing or invalid

**Used By**: All protected routes (require authentication)

**Example Request Header**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### `backend/middleware/roleMiddleware.js`
**Purpose**: Role-based access control (RBAC).

**Key Responsibilities**:
- Check if user has required role(s): `admin`, `super_admin`, `teacher`, `student`
- Return 403 if user lacks required role
- Allow multi-role checking (e.g., `['admin', 'super_admin']`)

**Used By**: Admin and privileged routes.

**Example**:
```javascript
router.use(roleMiddleware(['admin', 'super_admin']));
```

---

#### `backend/middleware/errorHandler.js`
**Purpose**: Global error handling and response formatting.

**Key Responsibilities**:
- Catch unexpected errors
- Format error responses consistently
- Log errors for debugging
- Return appropriate HTTP status codes

---

### Backend Route Files (API Endpoints)

#### `backend/routes/auth.js`
**Purpose**: User authentication and profile management.

**Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login (returns JWT)
- `GET /api/auth/profile` - Get current user profile [Auth required]
- `PUT /api/auth/profile` - Update user profile [Auth required]

**Key Functions**:
- `register()` - User registration with validation
- `login()` - Login with email/password, returns JWT token
- `getProfile()` - Fetch user with related data
- `updateProfile()` - Update profile and handle file uploads

---

#### `backend/routes/courses.js`
**Purpose**: Course management (CRUD operations).

**Endpoints**:
- `GET /api/courses` - Get all courses for browsing
- `GET /api/courses/:id` - Get single course details
- `POST /api/courses` - Create new course [Teacher only]
- `PUT /api/courses/:id` - Update course [Teacher only]
- `DELETE /api/courses/:id` - Delete course [Teacher only]

**Key Features**:
- Pagination and search support
- Thumbnail upload and storage
- Teacher authorization checks
- Course publishing/drafting

---

#### `backend/routes/students.js`
**Purpose**: Student management for administrators.

**Endpoints**:
- `GET /api/students` - Get all students [Admin only]
- `POST /api/students` - Create new student [Admin only]
- `PUT /api/students/:id` - Update student [Admin only]
- `DELETE /api/students/:id` - Delete student [Admin only]

**Key Validations**:
- Email uniqueness
- Roll number uniqueness within school
- Class exists and belongs to school

---

#### `backend/routes/lessons.js`
**Purpose**: Lesson management (video/text content).

**Endpoints**:
- `POST /api/lessons` - Upload new lesson [Teacher only]
- `GET /api/lessons/:id` - Get lesson details
- `PUT /api/lessons/:id` - Update lesson [Teacher only]
- `DELETE /api/lessons/:id` - Delete lesson [Teacher only]

**Supports**:
- Video file uploads
- Auto-thumbnail generation
- Lesson sequencing
- Duration tracking

---

#### `backend/routes/assignment.js` & `submission.js`
**Purpose**: Assignment creation and student submission handling.

**Endpoints**:
- `POST /api/assignment` - Create assignment [Teacher only]
- `GET /api/assignment` - Get assignments for class
- `POST /api/submission` - Submit assignment [Student]
- `GET /api/submission/:id` - Get submission details
- `PUT /api/submission/:id/grade` - Grade submission [Teacher only]

---

#### `backend/routes/liveClasses.js`
**Purpose**: Live class scheduling and management.

**Endpoints**:
- `POST /api/live-classes` - Schedule live class [Teacher only]
- `GET /api/live-classes` - Get live classes
- `PUT /api/live-classes/:id` - Update class details
- `DELETE /api/live-classes/:id` - Cancel live class

**Features**:
- Real-time notifications via Socket.IO
- Join URL management
- Attendance tracking

---

#### `backend/routes/admin.js` & `superAdmin.js`
**Purpose**: Administrative and super-admin operations.

**Key Endpoints**:
- School management
- User role management
- Analytics and reports
- System-wide settings

---

### Backend Models (Database Schemas)

#### `backend/models/User.js`
**Fields**:
- `name`, `email`, `phone`, `password` (hashed), `role`
- Profile: `bio`, `gender`, `dateOfBirth`, `profileImage`
- School-specific: `schoolId`, `school`
- Student-specific: `rollNumber`, `parentName`, `class`
- Teacher-specific: `qualification`, `specialization`, `experience`, `resume`
- Timestamps: `createdAt`, `updatedAt`

**Methods**:
- Password hashing/comparison (bcryptjs)
- Role validation

---

#### `backend/models/Course.js`
**Fields**:
- `title`, `description`, `category`, `thumbnail`
- `teacherId` (ref to User)
- `subjects` (array of Subject refs)
- `enrolledStudents`, `enrollmentCount`
- `isPublished`, `createdAt`, `updatedAt`

---

#### `backend/models/Lesson.js`
**Fields**:
- `title`, `description`, `topicId` (ref)
- `videoUrl` / `contentUrl`, `thumbnail`
- `duration`, `sequence`
- `createdBy` (ref to User)

---

#### `backend/models/Assignment.js`
**Fields**:
- `title`, `description`, `classId` (ref)
- `dueDate`, `totalPoints`
- `rubric` (grading criteria)
- `createdBy` (teacher)

---

#### `backend/models/Submission.js`
**Fields**:
- `assignmentId`, `studentId` (refs)
- `submissionFile`, `submissionText`
- `status` (pending/submitted/graded)
- `grades`, `feedback`
- `submittedAt`, `gradedAt`

---

#### `backend/models/LiveClass.js`
**Fields**:
- `title`, `classId`, `teacherId` (refs)
- `startTime`, `endTime`
- `meetUrl`, `status`
- `attendees` (array of student refs)

---

### Frontend Files

#### `frontend/src/App.jsx`
**Purpose**: Root React component and route setup.

**Key Elements**:
- Redux provider wrapper
- React Router configuration
- Protected route components
- Global layout wrapper

---

#### `frontend/src/redux/baseApi.js`
**Purpose**: RTK Query base configuration.

**Features**:
- Base URL configuration: `http://localhost:5000/api`
- JWT token injection in headers
- Error handling wrapper
- UPLOADS_BASE_URL export

---

#### `frontend/src/redux/*.js` (API Slices)
**Purpose**: RTK Query API definitions for different features.

**Each slice defines**:
- `query` endpoints (GET requests)
- `mutation` endpoints (POST, PUT, DELETE requests)
- Cache invalidation tags
- Error handling

**Example** (`subjectsApi.js`):
```javascript
getSubjects: builder.query({
  query: (classId) => `/subject-assignments?classId=${classId}`,
})
```

---

#### `frontend/src/components/AddSubjectModal.jsx`
**Purpose**: Modal form for creating/editing subjects.

**Functionality**:
- Form handling with React hooks
- Teacher dropdown selection
- Subject name input/selection
- Submit to Redux mutation hook

**Used By**: `ManageSubjects.jsx` page

---

#### `frontend/src/pages/AdminDashboard.jsx`
**Purpose**: Admin overview page.

**Displays**:
- Key metrics (students, teachers, courses)
- Recent activity
- Quick action buttons

---

#### `frontend/src/pages/ManageSubjects.jsx`
**Purpose**: Subject management interface.

**Features**:
- Class selection dropdown
- Subject listing table
- Add/Edit/Delete operations
- Teacher assignment

---

#### `frontend/src/components/ProtectedRoute.jsx`
**Purpose**: Route protection based on authentication.

**Function**:
- Check if user is logged in
- Redirect to login if not authenticated
- Allow access if authenticated

---

#### `frontend/src/components/RoleProtectedRoute.jsx`
**Purpose**: Route protection based on user role.

**Function**:
- Check user role (admin, teacher, student)
- Redirect if insufficient permissions
- Allow role-based page access

---

### Socket.IO Real-time

#### `backend/sockets/socketHandler.js`
**Purpose**: Handle real-time features.

**Typical Events**:
- `user-joined-class` - Student joins live class
- `attendance-marked` - Attendance submission
- `new-notification` - Real-time notification push
- `chat-message` - Live class chat
- `assignment-submitted` - Real-time submission update

---

## 🔌 API Documentation

### Authentication APIs

| Method | Endpoint | Description | Auth | Body | Response |
|--------|----------|-------------|------|------|----------|
| POST | `/api/auth/register` | Register new user | ❌ | `{ name, email, phone, password, role }` | `{ message, token?, user? }` |
| POST | `/api/auth/login` | User login | ❌ | `{ email, password }` | `{ token, user: { id, name, email, role, profileImage } }` |
| GET | `/api/auth/profile` | Get user profile | ✅ | - | User object with enrolled courses, created courses, progress |
| PUT | `/api/auth/profile` | Update user profile | ✅ | Form data with optional files | `{ message, user }` |

### Request & Response Examples

#### Register
**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePass123",
  "role": "student"
}
```

**Response** (201):
```json
{
  "message": "User registered successfully! Please login with your credentials."
}
```

---

#### Login
**Request**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "profileImage": "/uploads/profiles/profile-1234567890-john.jpg"
  }
}
```

---

### Course APIs

| Method | Endpoint | Description | Auth | Role | Query Params |
|--------|----------|-------------|------|------|--------------|
| GET | `/api/courses` | Get all courses | ❌ | - | `page`, `limit`, `category`, `search` |
| GET | `/api/courses/:id` | Get course details | ✅ | - | - |
| POST | `/api/courses` | Create course | ✅ | teacher | - |
| PUT | `/api/courses/:id` | Update course | ✅ | teacher | - |
| DELETE | `/api/courses/:id` | Delete course | ✅ | teacher | - |

#### Create Course Example

**Request** (POST `/api/courses`):
```json
{
  "title": "Advanced JavaScript",
  "description": "Master JavaScript with real-world projects",
  "category": "Programming",
  "isPublished": true
}
```

**Response** (201):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Advanced JavaScript",
  "description": "Master JavaScript with real-world projects",
  "category": "Programming",
  "teacherId": "507f1f77bcf86cd799439012",
  "isPublished": true,
  "thumbnail": "/uploads/thumbnails/course-1234567890-thumb.jpg",
  "enrolledStudents": [],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Subject Assignment APIs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/subject-assignments?classId=:classId` | Get subjects for class | ✅ | admin, teacher |
| POST | `/api/subject-assignments` | Create subject for class | ✅ | admin, teacher |
| PUT | `/api/subject-assignments/:id` | Update subject | ✅ | admin, teacher |
| DELETE | `/api/subject-assignments/:id` | Delete subject | ✅ | admin, teacher |

#### Create Subject Assignment Example

**Request** (POST `/api/subject-assignments`):
```json
{
  "name": "Mathematics",
  "classId": "507f1f77bcf86cd799439011",
  "teacherId": "507f1f77bcf86cd799439012"
}
```

**Response** (201):
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Mathematics",
  "class": "507f1f77bcf86cd799439011",
  "teacher": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Ms. Smith",
    "email": "smith@school.com"
  },
  "school": "507f1f77bcf86cd799439010",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Student Management APIs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/students` | Get all students | ✅ | admin |
| POST | `/api/students` | Create student | ✅ | admin |
| PUT | `/api/students/:id` | Update student | ✅ | admin |
| DELETE | `/api/students/:id` | Delete student | ✅ | admin |

#### Create Student Example

**Request** (POST `/api/students`):
```json
{
  "name": "Alice Johnson",
  "email": "alice@school.com",
  "phone": "9876543210",
  "rollNumber": "CS001",
  "parentName": "Robert Johnson",
  "parentPhone": "9876543211",
  "class": "507f1f77bcf86cd799439011"
}
```

**Response** (201):
```json
{
  "message": "Student created successfully",
  "student": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Alice Johnson",
    "email": "alice@school.com",
    "phone": "9876543210",
    "rollNumber": "CS001",
    "parentName": "Robert Johnson",
    "parentPhone": "9876543211",
    "class": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "10-A",
      "section": "A"
    },
    "role": "student"
  }
}
```

---

### Assignment APIs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/assignment` | Get assignments | ✅ | teacher, student |
| POST | `/api/assignment` | Create assignment | ✅ | teacher |
| PUT | `/api/assignment/:id` | Update assignment | ✅ | teacher |
| DELETE | `/api/assignment/:id` | Delete assignment | ✅ | teacher |

---

### Submission APIs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/submission/:id` | Get submission | ✅ | teacher, student |
| POST | `/api/submission` | Submit assignment | ✅ | student |
| PUT | `/api/submission/:id/grade` | Grade submission | ✅ | teacher |

---

### Live Class APIs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/live-classes` | Get live classes | ✅ | - |
| POST | `/api/live-classes` | Schedule live class | ✅ | teacher |
| PUT | `/api/live-classes/:id` | Update live class | ✅ | teacher |
| DELETE | `/api/live-classes/:id` | Delete live class | ✅ | teacher |

---

## ⚙️ Installation Steps

### Prerequisites
- **Node.js** (v14+) and npm
- **MongoDB** (local or MongoDB Atlas connection)
- **Git** (for version control)
- **Code Editor** (VS Code recommended)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd classroom
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env  # Or create manually with your values

# Verify MongoDB connection in .env
# MONGO_URI=mongodb://localhost:27017/classroom

# Start backend server
npm run dev
# Server will run on http://localhost:5000
```

**To verify backend is running**:
```bash
curl http://localhost:5000/health
# Expected response: { "status": "OK", "message": "..." }
```

### Step 3: Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
# Server will run on http://localhost:5173
```

### Step 4: Environment Configuration

**Backend `.env` file**:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/classroom

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# File Upload (use Cloudinary or local)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Client
CLIENT_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000

# Email (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Frontend `.env` file** (create in `frontend/` root):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## ▶️ Usage Instructions

### Running the Project

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

**Access Points**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Documentation: Check VALIDATION_DOCUMENTATION.md

### Example Workflow

#### 1. Register as Admin
```bash
POST /api/auth/register
Body: {
  "name": "Admin User",
  "email": "admin@school.com",
  "phone": "9876543210",
  "password": "SecureAdmin123",
  "role": "admin"
}
```

#### 2. Login
```bash
POST /api/auth/login
Body: {
  "email": "admin@school.com",
  "password": "SecureAdmin123"
}
Response: { "token": "jwt_token_here" }
```

#### 3. Create a Class (as Admin)
```bash
POST /api/classes
Headers: {
  "Authorization": "Bearer jwt_token_here"
}
Body: {
  "name": "10th Grade",
  "section": "A",
  "classCode": "10A2024"
}
```

#### 4. Create a Subject Assignment
```bash
POST /api/subject-assignments
Headers: {
  "Authorization": "Bearer jwt_token_here"
}
Body: {
  "name": "Mathematics",
  "classId": "class_id_from_step_3",
  "teacherId": "teacher_id"
}
```

#### 5. Create Student (as Admin)
```bash
POST /api/students
Headers: {
  "Authorization": "Bearer jwt_token_here"
}
Body: {
  "name": "John Student",
  "email": "john@student.com",
  "phone": "9876543211",
  "rollNumber": "10-001",
  "parentName": "Jane Student",
  "parentPhone": "9876543212",
  "class": "class_id_from_step_3"
}
```

#### 6. Create Course (as Teacher)
```bash
POST /api/courses
Headers: {
  "Authorization": "Bearer jwt_token_here"
}
Body: {
  "title": "Mathematics Fundamentals",
  "description": "Learn math basics",
  "category": "Mathematics",
  "isPublished": true
}
```

#### 7. Student Enrolls in Course
```bash
POST /api/courses/:courseId/enroll
Headers: {
  "Authorization": "Bearer student_jwt_token"
}
```

---

## 🔐 Environment Variables

### Server Configuration

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `PORT` | 5000 | Server listening port | 5000 |
| `NODE_ENV` | development | Environment mode | development, production |

### Database

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `MONGO_URI` | - | MongoDB connection string | mongodb://localhost:27017/classroom |

### JWT Authentication

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `JWT_SECRET` | - | Secret key for JWT signing | your_super_secret_key_123 |
| `JWT_EXPIRE` | 7d | JWT token expiration | 7d, 24h |
| `JWT_REFRESH_SECRET` | - | Refresh token secret | your_refresh_secret_123 |
| `JWT_REFRESH_EXPIRE` | 30d | Refresh token expiration | 30d |

### Email Configuration

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `EMAIL_SERVICE` | gmail | Email service provider | gmail, outlook |
| `EMAIL_USER` | - | Email address for sending | noreply@classroom.com |
| `EMAIL_PASS` | - | Email app password | app_specific_password |
| `EMAIL_FROM` | - | Sender email address | noreply@classroom.com |

### File Upload (Cloudinary)

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | - | Cloudinary cloud name | my_cloud_123 |
| `CLOUDINARY_API_KEY` | - | Cloudinary API key | 123456789 |
| `CLOUDINARY_API_SECRET` | - | Cloudinary API secret | secret_key_123 |

### File Upload (AWS S3 - Alternative)

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | - | AWS access key | AKIAIOSFODNN7EXAMPLE |
| `AWS_SECRET_ACCESS_KEY` | - | AWS secret key | wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY |
| `AWS_REGION` | us-east-1 | AWS region | us-east-1 |
| `S3_BUCKET_NAME` | - | S3 bucket name | my-classroom-bucket |

### CORS & Socket.IO

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `CLIENT_URL` | http://localhost:3000 | Frontend URL for CORS | http://localhost:5173 |
| `SOCKET_CORS_ORIGIN` | http://localhost:3000 | Socket.IO CORS origin | http://localhost:5173 |

### Rate Limiting

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (ms) | 900000 (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window | 100 |

### File Upload Limits

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `MAX_FILE_SIZE` | 10MB | Maximum file size | 10485760 (10MB) |
| `MAX_FILES_COUNT` | 10 | Maximum files per upload | 10 |

---

## 🧪 Example Workflow

### Complete User Journey: From Registration to Assignment Submission

#### **User: Admin Setup Phase**

1. **Register as Admin**
   - Navigate to registration page
   - Fill: Name, Email, Phone, Password, Select Role = "Admin"
   - Submit → Email verified → Login

2. **Login as Admin**
   - Email + Password → JWT token received
   - Redirected to Admin Dashboard

3. **Create School/Institution**
   - Click "Manage Schools"
   - Enter: School Name, Address, Principal Name
   - Save → School ID created (e.g., `school_001`)

4. **Create Classes**
   - Go to "Manage Classes"
   - Add: Class Name (10th Grade), Section (A), ClassCode (10A2024)
   - Save → Class ID created (e.g., `class_001`)

5. **Create Teachers**
   - Go to "Manage Teachers"
   - Add: Name, Email, Phone, Qualification, Subject Specialization
   - Save → Teacher User created with role `teacher`

6. **Create Students**
   - Go to "Manage Students"
   - Add: Name, Email, Phone, Roll Number, Parent Info, Assign to Class
   - Save → Student created and assigned to `class_001`

7. **Assign Teachers to Subjects**
   - Go to "Subject Assignments"
   - Select: Class (10A), Subject (Mathematics), Teacher (Mr. Smith)
   - Save → Subject-Teacher mapping created

---

#### **User: Teacher Content Creation Phase**

1. **Teacher Logs In**
   - Email + Password → Authenticated

2. **Create Course**
   - Click "Create Course"
   - Enter: Title ("Mathematics Fundamentals"), Description, Category
   - Upload: Course Thumbnail
   - Publish → Course created (e.g., `course_001`)

3. **Create Course Structure**
   - Go to Course → "Add Subject"
   - Add: Subject Name (Algebra)
   - Then: Add Chapters → Add Topics → Add Lessons

   **Example Structure**:
   ```
   Course: Mathematics Fundamentals
   └── Subject: Algebra
       └── Chapter 1: Basics
           └── Topic 1: Variables
               └── Lesson 1: Introduction to Variables (Video)
               └── Lesson 2: Solving Equations (Video)
   ```

4. **Upload Video Lesson**
   - Go to Topic → "Add Lesson"
   - Enter: Lesson Title, Description
   - Upload: Video File → Thumbnail auto-generated
   - Save → Lesson accessible to enrolled students

5. **Create Assignment**
   - Click "Create Assignment"
   - Enter: Title ("Solve 10 Algebra Problems")
   - Set: Due Date, Points
   - Upload: Assignment Instructions/Files
   - Assign to: Class (10A)
   - Publish → Students notified

6. **Schedule Live Class**
   - Click "Schedule Live Class"
   - Enter: Title, Date, Time
   - Add: Google Meet Link or Zoom Link
   - Notify: Students via notification
   - Start class at scheduled time

---

#### **User: Student Learning Phase**

1. **Student Logs In**
   - Email + Password → Authenticated
   - Redirected to Student Dashboard

2. **Enroll in Course**
   - Browse courses
   - Click "Mathematics Fundamentals" → View details
   - Click "Enroll Now"
   - Enrollment confirmed → Course appears in "My Courses"

3. **Access Course Materials**
   - Go to "My Courses" → "Mathematics Fundamentals"
   - View: Course structure (Subjects → Chapters → Topics → Lessons)
   - Click Lesson 1: Introduction to Variables
   - Watch video ✓ (Progress updated to 50% for topic)
   - Watch video ✓ (Progress updated to 100% for topic)
   - Dashboard shows: 40% completed

4. **Complete Assignment**
   - Go to "Assignments" → View "Solve 10 Algebra Problems"
   - Read instructions
   - Download: Sample problems
   - Complete work → Upload file or enter text
   - Click "Submit"
   - Confirmation: "Assignment submitted on time"
   - Status: "Pending Review"

5. **Attend Live Class**
   - Notification: "Live class starting in 5 minutes"
   - Click "Join Class"
   - Open Google Meet link
   - Interact: Ask questions in chat
   - Attendance marked automatically
   - Class recording available after

6. **View Assignment Feedback**
   - Go to "Submissions" → "Solve 10 Algebra Problems"
   - View: Points earned (8/10)
   - Read: Teacher feedback ("Great work! Review Q#3")
   - Download: Graded document

---

#### **Using Real-time Features**

1. **Live Notification Example**
   - Teacher posts assignment
   - Socket.IO event: `new-assignment` → All students receive notification
   - Toast appears: "New Assignment: Solve 10 Problems (Due: Jan 20)"

2. **Live Class Attendance**
   - Student joins live class
   - Socket.IO event: `student-joined` → Teacher sees join
   - Attendance: Automatically marked present
   - Real-time chat functioning

3. **Grade Notification**
   - Teacher grades assignment
   - Socket.IO event: `submission-graded` → Student receives notification
   - Redis cache cleared → Fresh grade data loaded

---

## 🚀 Future Improvements (Optional)

- 🎓 **Advanced Analytics**: Detailed learning analytics and AI-powered insights
- 🤖 **AI Tutor**: AI chatbot for student Q&A
- 📊 **Analytics Dashboard**: Enhanced performance tracking and reporting
- 🌍 **Multi-language Support**: Support for multiple languages
- 📱 **Mobile App**: Native mobile application (React Native/Flutter)
- 🔐 **Advanced Security**: Two-factor authentication (2FA), encryption
- 🎯 **Gamification**: Badges, points, leaderboards
- 📚 **Resource Library**: Shared resource bank for teachers
- 🎬 **Video Streaming**: Adaptive bitrate streaming
- 🧠 **Adaptive Learning**: AI-based personalized learning paths

---

## 🤝 Contributing Guidelines (Optional)

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/classroom.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Write clear commit messages
   - Test your changes

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Describe your changes
   - Reference related issues

---

## 📄 License (Optional)

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions:
- **Email**: support@classroom.edu
- **GitHub Issues**: Report bugs and request features
- **Documentation**: See VALIDATION_DOCUMENTATION.md for API validation details

---

**Last Updated**: April 23, 2026
**Version**: 1.3.0

### Recent Updates (v1.3.0)
- ✅ **Attendance System Refactor**: Removed session-based attendance, simplified to direct class-date marking
- ✅ **Theme System Enhancement**: Fixed dropdown and button visibility across all themes (light, dark, blue, red, purple, custom)
- ✅ **Modal Button Fixes**: Updated all modal create buttons to use theme-aware classes
- ✅ **Icon Visibility**: Fixed icon visibility in FeeManagement page for all themes
- ✅ **Student Class Assignment**: Enhanced authentication response to include class data
- ✅ **Debug Logging**: Added comprehensive debug logging for attendance troubleshooting

### For Admins
- Manage users (teachers and students) with role-based permissions
- Oversee all courses and content with moderation tools
- **Manage subject assignments per class with teacher allocation**
- View comprehensive system analytics and usage reports
- Manage notifications and system-wide announcements
- **Attendance Management**: View attendance statistics, calendar views, and manage attendance records
- **Fee Management**: Track student fees, payments, and generate reports

### Subject Management System
The LMS includes a comprehensive subject management system that allows administrators to:
- Assign subjects (Maths, Science, English, etc.) to specific classes
- Allocate teachers to each subject within a class
- Prevent duplicate subject assignments per class
- Manage subject-teacher relationships with full CRUD operations
- View subject assignments organized by class with teacher details

### Attendance System
The attendance system has been refactored to simplify the marking process:
- **Direct Attendance Marking**: Students and teachers can mark attendance directly by class and date
- **No Session Dependency**: Removed intermediate attendance sessions for simpler workflow
- **Date Normalization**: Consistent date handling across the system
- **Role-Based Marking**: Students mark their own attendance, teachers mark for entire class
- **Calendar Integration**: Visual calendar views for attendance tracking
- **Duplicate Prevention**: System prevents duplicate attendance records

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks and functional components
- **Vite** - Fast build tool and development server with hot reload
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Redux Toolkit** - Simplified state management with Redux
- **RTK Query** - Data fetching and caching solution
- **React Router DOM** - Client-side routing and navigation
- **React Icons** - Rich library of icons
- **React Toastify** - Toast notifications with customizable themes
- **Axios** - HTTP client for API requests (via RTK Query)

### Backend
- **Node.js** - JavaScript runtime for server-side execution
- **Express.js** - Lightweight and flexible web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - MongoDB object modeling with schema validation
- **JWT (jsonwebtoken)** - Secure token-based authentication
- **bcryptjs** - Password hashing and verification
- **Socket.io** - Real-time bidirectional communication
- **Express File Upload** - Middleware for handling file uploads
- **Express Validator** - Input validation middleware
- **Helmet** - Security middleware for HTTP headers
- **Morgan** - HTTP request logger
- **Winston** - Application logging system
- **Dotenv** - Environment variable management
- **CORS** - Cross-Origin Resource Sharing support
- **Compression** - Response compression middleware
- **Express Rate Limit** - Rate limiting for API endpoints

## 📁 Project Structure & File Documentation

### Backend Directory Structure

#### Core Files
```
backend/
├── server.js               # Main Express server entry point, initializes app and starts server
├── package.json            # Project dependencies and npm scripts
├── package-lock.json       # Lockfile for exact dependency versions
├── .env                    # Environment variables (DATABASE_URL, JWT_SECRET, PORT, etc.)
├── .env.example            # Template for environment variables setup
└── .gitignore              # Git ignore patterns for backend
```

#### Configuration (`backend/config/`)
- **database.js** - MongoDB connection setup and Mongoose configuration

#### Middleware (`backend/middleware/`)
- **authMiddleware.js** - JWT token verification middleware for protected routes
- **errorHandler.js** - Global error handling middleware for consistent error responses
- **roleMiddleware.js** - Role-based access control (checks user role: admin/teacher/student)

#### Models (`backend/models/`) - Mongoose Schemas
- **User.js** - User schema with roles (student, teacher, admin), profile data, authentication
- **Course.js** - Course schema with title, description, teacher reference, student enrollments
- **Subject.js** - Subject schema for course organization
- **Chapter.js** - Chapter schema for course structure
- **Topic.js** - Topic schema for detailed course content organization
- **Lesson.js** - Lesson schema with video/note uploads, visibility controls
- **LiveClass.js** - Live class session schema with meet link, recording URLs
- **Test.js** - Quiz/test schema with questions and grading
- **Question.js** - Question schema for tests (MCQ, short answer, etc.)
- **Assignment.js** - Assignment schema with submission deadlines
- **Submission.js** - Student submission schema with grade tracking
- **Classroom.js** - Virtual classroom schema for group learning
- **SubjectAssignment.js** - Subject assignment schema linking subjects to classes and teachers
- **Schedule.js** - Class schedule/timetable schema
- **Notification.js** - Notification messages for users
- **Result.js** - Student test results and performance tracking
- **Analytics.js** - Learning analytics and progress metrics

#### Routes (`backend/routes/`) - API Endpoints with Integrated Controllers
- **auth.js** - Authentication endpoints (register, login, getProfile, updateProfile)
- **courses.js** - Course management endpoints (create, read, update, delete, publish/unpublish)
- **subjects.js** - Subject management endpoints
- **chapters.js** - Chapter management endpoints
- **topics.js** - Topic management endpoints
- **lessons.js** - Lesson upload and management endpoints
- **liveClasses.js** - Live class scheduling and management endpoints
- **assignment.js** - Assignment creation and management endpoints
- **submission.js** - Submission upload and grading endpoints
- **admin.js** - Admin-only endpoints for user management and analytics
- **subjectAssignments.js** - Subject assignment management endpoints (admin only)
- **classroom.js** - Virtual classroom creation and management

#### Utilities (`backend/utils/`)
- **logger.js** - Winston logger configuration for file and console logging
- **upload.js** - File upload middleware configuration and path setup
- **generateCode.js** - Utility for generating unique classroom/session codes

#### Storage (`backend/uploads/`)
- **lessons/** - Stores uploaded video lesson files
- **profiles/** - Stores user profile images
- **thumbnails/** - Stores course thumbnail images

#### Logging (`backend/logs/`)
- **all.log** - Combined application and access logs
- **error.log** - Error-specific logs

#### WebSockets (`backend/sockets/`)
- **socketHandler.js** - Socket.io event handlers for real-time features (live chat, notifications)

---

### Frontend Directory Structure

#### Root Configuration Files
```
frontend/
├── .env                    # Environment variables (VITE_API_BASE_URL=http://localhost:5000/api)
├── .env.example            # Template for environment setup
├── .gitignore              # Git ignore patterns
├── vite.config.js          # Vite build configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration for Tailwind
├── index.html              # HTML entry point
├── package.json            # Project dependencies and scripts
├── package-lock.json       # Lockfile for exact dependency versions
├── README.md               # Project documentation
└── .github/copilot-instructions.md  # GitHub Copilot instructions
```

#### Source Code (`frontend/src/`)

##### Entry Point
- **main.jsx** - App initialization and Redux store setup
- **App.jsx** - Root component with routing setup
- **index.css** - Global styles and Tailwind imports

##### Context (`frontend/src/context/`)
- **AuthContext.jsx** - Global authentication state, user login/register/logout management

##### Redux State Management (`frontend/src/redux/`)
- **store.js** - Redux store configuration combining all slices
- **baseApi.js** - Base RTK Query configuration with authentication headers
- **apiSlice.js** - Exports all API slices for centralized imports
- **authApi.js** - RTK Query authentication endpoints (login, register, password reset)
- **coursesApi.js** - RTK Query endpoints for course management
- **classesApi.js** - RTK Query endpoints for classroom management
- **profileApi.js** - RTK Query endpoints for user profile management
- **subjectsApi.js** - RTK Query endpoints for subject assignment management
- **adminApi.js** - RTK Query endpoints for admin operations

##### Components (`frontend/src/components/`) - Reusable UI Components
- **AddSubjectModal.jsx** - Modal component for adding/editing subject assignments
- **AssignmentCard.jsx** - Card component for displaying assignment details
- **Breadcrumb.jsx** - Navigation breadcrumb component
- **ClassroomCard.jsx** - Card component for classroom listings
- **EmptyState.jsx** - Component for empty states (no data scenarios)
- **FilterDropdown.jsx** - Dropdown component for filtering content
- **Footer.jsx** - Site footer component
- **Loader.jsx** - Loading spinner component
- **Modal.jsx** - Reusable modal dialog component
- **Navbar.jsx** - Main navigation bar
- **Pagination.jsx** - Pagination controls for lists
- **ProtectedRoute.jsx** - Route wrapper for authentication protection
- **RoleProtectedRoute.jsx** - Route wrapper for role-based access control
- **SearchBar.jsx** - Search input component
- **Sidebar.jsx** - Sidebar navigation component
- **SubmissionForm.jsx** - Form for submitting assignments
- **Toast.jsx** - Toast notification component

##### Layouts (`frontend/src/layouts/`)
- **MainLayout.jsx** - Main application layout with navbar and sidebar

##### Pages (`frontend/src/pages/`) - Full Page Components

###### Authentication Pages
- **Login.jsx** - User login page
- **Register.jsx** - User registration page
- **ForgotPassword.jsx** - Password recovery page
- **ResetPassword.jsx** - Password reset page

###### Dashboard Pages
- **Dashboard.jsx** - General dashboard (redirects based on role)
- **AdminDashboard.jsx** - Admin overview with system statistics
- **StudentDashboard.jsx** - Student dashboard with enrolled courses
- **TeacherDashboard.jsx** - Teacher dashboard with created courses

###### Admin Pages
- **AdminProfile.jsx** - Admin profile management
- **AdminManageCourses.jsx** - Course management interface for admins
- **AdminManageLiveClasses.jsx** - Live class management for admins
- **AdminManageNotifications.jsx** - Notification management
- **AdminManageReports.jsx** - System reports and analytics
- **AdminManageStudents.jsx** - Student user management
- **AdminManageTeachers.jsx** - Teacher user management
- **ManageSubjects.jsx** - Subject assignment management for classes
- **AdminManageTests.jsx** - Test/quiz management

###### Student Pages
- **StudentProfile.jsx** - Student profile management
- **StudentCourses.jsx** - Available courses listing
- **StudentMyCourses.jsx** - Enrolled courses dashboard
- **StudentCourseDetails.jsx** - Detailed course view with chapters/topics
- **StudentSubject.jsx** - Subject-specific content view
- **StudentChapter.jsx** - Chapter content and lessons
- **StudentLesson.jsx** - Individual lesson viewer
- **StudentLiveClasses.jsx** - Live classes schedule and recordings
- **StudentRecordedVideos.jsx** - Recorded video lessons
- **StudentSchedule.jsx** - Class schedule/timetable
- **StudentAnalytics.jsx** - Learning progress and analytics
- **StudentQuizResult.jsx** - Quiz/test results display
- **StudentTest.jsx** - Test taking interface

###### Teacher Pages
- **TeacherProfile.jsx** - Teacher profile management
- **TeacherCourses.jsx** - Teacher's created courses overview
- **TeacherCreateCourse.jsx** - Course creation form
- **TeacherCourseManagement.jsx** - Course editing and management
- **TeacherCreateSubject.jsx** - Subject creation for courses
- **TeacherCreateChapter.jsx** - Chapter creation for subjects
- **TeacherCreateTopic.jsx** - Topic creation for chapters
- **TeacherUploadLesson.jsx** - Lesson video/note upload interface
- **TeacherUploadNotes.jsx** - Additional notes upload
- **TeacherCreateTest.jsx** - Test/quiz creation interface
- **TeacherAddQuestions.jsx** - Question addition to tests
- **TeacherCreateAssignment.jsx** - Assignment creation form
- **TeacherSchedule.jsx** - Class scheduling interface
- **TeacherStudentList.jsx** - Student enrollment management
- **TeacherSubjectList.jsx** - Subject management overview

###### Classroom Pages
- **ClassroomPage.jsx** - Virtual classroom interface
- **CreateClassroom.jsx** - Classroom creation page
- **JoinClassroom.jsx** - Classroom joining interface

###### Assignment Pages
- **AssignmentPage.jsx** - Assignment details and submission

##### Routing (`frontend/src/routes/`)
- **index.js** - Route definitions and protected route configurations

#### Build Output (`frontend/dist/`)
- **index.html** - Built HTML entry point
- **assets/** - Compiled CSS and JS bundles
- Route configuration and protected route components

##### Layouts (`frontend/src/layouts/`)
- **MainLayout.jsx** - Primary layout wrapper with navbar and sidebar

##### Components (`frontend/src/components/`) - Reusable UI Pieces
- **Navbar.jsx** - Top navigation bar with user profile menu
- **Sidebar.jsx** - Side navigation menu based on user role
- **ProtectedRoute.jsx** - Route guard for authenticated users
- **RoleProtectedRoute.jsx** - Route guard for role-based access (admin/teacher/student)
- **Loader.jsx** - Loading spinner component
- **Modal.jsx** - Reusable modal dialog component
- **Toast.jsx** - Toast notification component
- **SearchBar.jsx** - Global search functionality
- **Pagination.jsx** - Pagination control component
- **FilterDropdown.jsx** - Reusable filter dropdown
- **Breadcrumb.jsx** - Breadcrumb navigation
- **EmptyState.jsx** - Empty state placeholder component
- **AssignmentCard.jsx** - Card component for displaying assignments
- **ClassroomCard.jsx** - Card component for displaying classrooms
- **SubmissionForm.jsx** - Form component for submitting assignments
- **Footer.jsx** - Footer component

##### Pages (`frontend/src/pages/`) - Page Components

###### Authentication Pages
- **Login.jsx** - User login page
- **Register.jsx** - User registration page
- **ForgotPassword.jsx** - Password recovery page
- **ResetPassword.jsx** - Password reset confirmation page

###### Common Dashboards
- **Dashboard.jsx** - General dashboard (redirects based on role)

###### Student Pages
- **StudentDashboard.jsx** - Student home dashboard with recent courses/assignments
- **StudentCourses.jsx** - List of all available courses to enroll
- **StudentMyCourses.jsx** - Student's enrolled courses
- **StudentCourseDetails.jsx** - Detailed course view with chapters
- **StudentChapter.jsx** - Chapter content and topics
- **StudentSubject.jsx** - Subject-specific content
- **StudentLesson.jsx** - Individual lesson video/notes viewing
- **StudentTest.jsx** - Quiz/test taking page
- **StudentQuizResult.jsx** - Quiz result and score display
- **StudentLiveClasses.jsx** - Upcoming and recorded live classes
- **StudentSchedule.jsx** - Class schedule/timetable
- **StudentRecordedVideos.jsx** - View recorded class videos
- **StudentAnalytics.jsx** - Personal learning progress and analytics
- **StudentProfile.jsx** - Student profile editing

###### Teacher Pages
- **TeacherDashboard.jsx** - Teacher home with course overview
- **TeacherCourses.jsx** - List of courses created by teacher
- **TeacherCreateCourse.jsx** - Create new course form
- **TeacherCourseManage.jsx** - Manage existing course details
- **TeacherCreateSubject.jsx** - Add subject to course
- **TeacherSubjectManage.jsx** - Manage course subjects
- **TeacherCreateChapter.jsx** - Add chapter to subject
- **TeacherCreateTopic.jsx** - Add topic to chapter
- **TeacherUploadLesson.jsx** - Upload video lessons
- **TeacherUploadNotes.jsx** - Upload course notes/materials
- **TeacherCreateTest.jsx** - Create quiz/test
- **TeacherAddQuestions.jsx** - Add questions to test
- **TeacherScheduleLiveClass.jsx** - Schedule live class session
- **TeacherStudentResults.jsx** - View student test results
- **TeacherProfile.jsx** - Teacher profile editing

###### Admin Pages
- **AdminDashboard.jsx** - Admin overview with system statistics
- **AdminManageTeachers.jsx** - Manage teacher accounts (approve, block, delete)
- **AdminManageStudents.jsx** - Manage student accounts
- **AdminManageCourses.jsx** - Oversee all courses, publish/unpublish
- **AdminManageLiveClasses.jsx** - Manage live class sessions
- **AdminManageTests.jsx** - Manage all system tests
- **AdminManageNotifications.jsx** - Send and manage system notifications
- **AdminManageReports.jsx** - View usage reports and analytics
- **AdminProfile.jsx** - Admin profile editing

###### General Pages
- **ClassroomPage.jsx** - Virtual classroom view and interaction
- **CreateClassroom.jsx** - Create new virtual classroom
- **JoinClassroom.jsx** - Join existing classroom with code
- **AssignmentPage.jsx** - Assignment details and submission view

##### Assets (`frontend/src/assets/`)
- Stores images, icons, and static media files

## 🔐 Key Features & Implementation

### Authentication Flow
1. User registers/logs in via **auth.js** routes
2. JWT token stored in localStorage with automatic refresh
3. **AuthContext.jsx** manages global user state
4. **authMiddleware.js** validates token on protected routes
5. **RoleProtectedRoute.jsx** enforces role-based access

### API Integration
1. All API calls use **RTK Query** for caching and state management
2. **apiSlice.js** defines all data-fetching endpoints with auto-invalidation
3. **baseApi.js** provides centralized API configuration with authentication headers
4. Environment variable **VITE_API_BASE_URL** controls API endpoint

### File Upload System
1. Frontend accepts files via individual role-specific profile pages and **SubmissionForm.jsx**
2. FormData sent to backend routes with validation
3. Backend **upload.js** validates file types, sizes, and saves to **uploads/** directory
4. Full URLs constructed using **UPLOADS_BASE_URL** for proper cross-origin access
5. Support for images (thumbnails, profiles) and videos (lessons, recordings)

### Real-time Features
1. **Socket.io** handlers in **socketHandler.js**
2. Server broadcasts events to connected clients
3. Enables live notifications, chat, and real-time updates

### Form Validation & Error Handling
1. Comprehensive client-side validation for all profile forms
2. Real-time validation feedback with error summaries
3. Character counters and input length restrictions
4. Server-side validation with detailed error responses
5. Toast notifications for user feedback

## 🚦 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get logged-in user profile
- `PUT /api/auth/profile` - Update user profile

### Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (teacher only)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Subject Assignments
- `GET /api/subject-assignments?classId=xxx` - Get subjects for a class (admin only)
- `POST /api/subject-assignments` - Create subject assignment (admin only)
- `PUT /api/subject-assignments/:id` - Update subject assignment (admin only)
- `DELETE /api/subject-assignments/:id` - Delete subject assignment (admin only)

### Lessons, Tests, Assignments, etc.
- See respective route files for complete endpoint documentation

## 🔧 Development Workflow

1. **Backend Changes**: Modify route files → Restart `npm run dev`
2. **Frontend Changes**: Components hot-reload with Vite
3. **Model Changes**: Update Mongoose schema → Restart backend
4. **Environment**: Change `.env` values and restart servers

## 📝 Environment Variables

### Backend `.env`
```
DATABASE_URL=mongodb://localhost:27017/classroom
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following the existing code structure
3. Update relevant files and commit: `git commit -m "Add feature"`
4. Push and create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions, please open an issue on the repository.

    │   │   ├── AdminDashboard.jsx
    │   │   └── ...
    │   ├── redux/               # Redux store and slices
    │   │   └── store.js
    │   ├── routes/              # Route definitions
    │   ├── services/            # API service functions
    │   │   └── api.js
    │   ├── utils/               # Utility functions
    │   ├── App.jsx              # Root component
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Global styles
    ├── .github/                 # GitHub workflows
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGO_URI=mongodb://localhost:27017/classroom

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRE=7d

   # Client URL
   CLIENT_URL=http://localhost:5173

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # File Upload
   MAX_FILE_SIZE=10485760

   # Cloudinary (optional)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

5. **Start the backend server:**
   ```bash
   npm run dev  # For development with nodemon
   # or
   npm start    # For production
   ```

   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password/:token` - Password reset

### Courses
- `GET /api/courses` - Get all courses (admin/teacher)
- `GET /api/courses/student/enrolled` - Get enrolled courses (student)
- `GET /api/courses/teacher/my` - Get teacher's courses
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Subjects
- `GET /api/subjects/course/:courseId` - Get subjects for a course
- `POST /api/subjects/course/:courseId` - Create subject

### Chapters
- `GET /api/chapters/subject/:subjectId` - Get chapters for a subject
- `POST /api/chapters/subject/:subjectId` - Create chapter

### Topics
- `GET /api/topics/chapter/:chapterId` - Get topics for a chapter
- `POST /api/topics/chapter/:chapterId` - Create topic

### Lessons
- `GET /api/lessons/videos` - Get video lessons (student)
- `POST /api/lessons` - Create lesson
- `PUT /api/lessons/:id` - Update lesson

### Live Classes
- `GET /api/live-classes/student/my-classes` - Get student's live classes
- `GET /api/live-classes` - Get all live classes (teacher/admin)
- `POST /api/live-classes` - Schedule live class
- `POST /api/live-classes/:id/join` - Join live class

### Assignments
- `GET /api/assignment` - Get assignments
- `POST /api/assignment` - Create assignment

### Submissions
- `GET /api/submission` - Get submissions
- `POST /api/submission` - Submit assignment

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system statistics

### Subject Assignments (Admin Only)
- `GET /api/subject-assignments?classId=xxx` - Get subjects for a specific class
- `POST /api/subject-assignments` - Create new subject assignment
- `PUT /api/subject-assignments/:id` - Update subject assignment
- `DELETE /api/subject-assignments/:id` - Delete subject assignment

## 🔐 User Roles & Permissions

### Student
- View enrolled courses
- Access lessons and materials
- Join live classes
- Submit assignments
- View progress and analytics

### Teacher
- Create and manage courses
- Upload content and materials
- Schedule live classes
- Create assignments
- View student progress

### Admin
- All teacher permissions
- User management
- System-wide analytics
- Content moderation

## 🎯 Key Features Implemented

### ✅ Core Features
- **User Authentication**: Registration, login with JWT tokens and automatic refresh
- **Role-Based Access Control**: Student, Teacher, Admin roles with specific permissions
- **Course Management**: Create, update, delete courses with hierarchical structure
- **Content Delivery**: Video lessons, notes, and study materials with proper file handling
- **Live Classes**: Schedule and conduct live classes with real-time interaction
- **Assignment & Submission**: Teachers create assignments, students submit work with file uploads
- **Real-time Communication**: Socket.io for notifications and real-time updates
- **File Management**: Upload and manage course materials, thumbnails, and profile images
- **User Analytics**: Track student progress and engagement with visual indicators
- **Email Notifications**: Password reset and system notifications
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Form Validation**: Comprehensive validation with real-time feedback and error handling

### ✅ Recent Improvements (v1.1.0)
- **Fixed Course Thumbnails**: Proper URL construction for cross-origin image loading
- **Fixed Video Streaming**: Correct video file URLs for seamless lesson playback
- **Enhanced Form Validation**: Real-time validation with error summaries and character counters
- **Improved Error Handling**: Better user feedback with toast notifications
- **File Upload Optimization**: Proper handling of FormData and file validation
- **Cross-Origin Support**: Full URL construction for media files across different origins
- **UI Enhancements**: Better loading states, empty states, and responsive design
- ✓ JWT authentication with token expiration and refresh
- ✓ Role-based access control (Student/Teacher/Admin) with protected routes
- ✓ Course management with hierarchical structure (Course > Subject > Chapter > Topic > Lesson)
- ✓ Video lesson uploads and streaming with proper URL handling
- ✓ Course thumbnail display with cross-origin support
- ✓ Live class scheduling with real-time session management
- ✓ Assignment creation and student submission with file uploads
- ✓ File upload system with validation for images, videos, and documents
- ✓ Real-time notifications with Socket.io integration
- ✓ Responsive UI with Tailwind CSS and mobile optimization
- ✓ Progress tracking per course and lesson with visual indicators
- ✓ Email notifications for password reset and system alerts
- ✓ Admin user management and content moderation
- ✓ Subject management system for class-subject-teacher assignments
- ✓ Comprehensive form validation with real-time feedback
- ✓ Error handling with user-friendly messages and toast notifications
- ✓ Integrated logging with Winston and file rotation
- ✓ Cross-origin file serving for media content

### 🔄 Database Models
- **User**: Authentication, profile, and role information
- **Course**: Course details, enrollment tracking, and metadata
- **Subject**: Course subjects organization
- **SubjectAssignment**: Class-subject-teacher assignment management
- **Chapter**: Subject chapter structure
- **Topic**: Chapter topics/sections
- **Lesson**: Video/text content delivery
- **LiveClass**: Scheduled live sessions and attendance
- **Assignment**: Course assignments and specifications
- **Submission**: Student assignment submissions
- **Notification**: System-wide notifications
- **Analytics**: User progress and engagement metrics

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Use a process manager like PM2: `pm2 start server.js --name "classroom-api"`
3. Configure MongoDB Atlas for production database
4. Set strong JWT secret in production
5. Configure reverse proxy (nginx) for routing
6. Enable HTTPS/SSL certificates
7. Set up environment variables for all sensitive data

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Set production API URL in environment configuration
3. Serve static files from `dist/` directory using nginx or similar
4. Configure CDN for assets (optional)
5. Set up auto-deployment via CI/CD pipeline

## 🧪 Testing

```bash
# Backend tests (if available)
cd backend
npm test

# Frontend linting
cd frontend
npm run lint

# Build verification
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Changelog

### Version 1.3.0 (April 23, 2026)
- **Attendance System Refactor**: Removed session-based attendance, simplified to direct class-date marking
- **Removed**: AttendanceSession model and related session dependencies
- **Updated**: Attendance model to work without sessionId field
- **Updated**: markAttendance() function for direct attendance marking
- **Updated**: markClassAttendance() function for bulk class attendance
- **Removed**: getStudentSession() function and related API endpoints
- **Theme System Enhancement**: Fixed dropdown and button visibility across all themes
- **Fixed**: Dropdown text color in dark theme using CSS variables
- **Fixed**: All modal create buttons to use theme-aware btn-primary class
- **Fixed**: Icon visibility in FeeManagement page for all themes
- **Updated**: CreateStudentModal, CreateTeacherModal, AddSubjectModal, CreateClassModal button styling
- **Updated**: AssignTeacherModal, AssignClassModal, AssignClassesModal button styling
- **Updated**: ManageSubjects page Add Subject button styling
- **Student Class Assignment**: Enhanced authentication response to include class data
- **Updated**: Login response to include classId, class, schoolId, school fields
- **Debug Logging**: Added comprehensive debug logging for attendance troubleshooting
- **Added**: Debug logs in markAttendance() function for request tracking
- **Documentation**: Comprehensive README update with full architecture and file documentation
- **Added**: Detailed backend controller documentation
- **Added**: Complete frontend component and page documentation
- **Added**: Theme system architecture documentation
- **Added**: API endpoint documentation for attendance and fees
- **Added**: System architecture overview with component hierarchy

### Version 1.2.0 (April 13, 2026)
- **Added**: Complete Subject Management module for administrators
- **New**: Subject assignment system linking subjects to classes and teachers
- **Added**: SubjectAssignment model with class-subject-teacher relationships
- **Added**: subjectAssignments API endpoints (GET, POST, PUT, DELETE)
- **Added**: subjectsApi RTK Query integration for frontend
- **Added**: ManageSubjects admin page with class selection and subject management
- **Added**: AddSubjectModal component for creating/editing subject assignments
- **Added**: Inline teacher assignment dropdown in subject table
- **Enhanced**: Admin sidebar with "Manage Subjects" navigation
- **Security**: Admin-only access with school-based filtering
- **Validation**: Duplicate subject prevention per class
- **UI**: Responsive design with Tailwind CSS and proper loading states

### Version 1.1.0 (April 9, 2026)
- **Fixed**: Course thumbnail display issues with proper URL construction
- **Fixed**: Video lesson streaming with cross-origin file serving
- **Enhanced**: Form validation across all profile pages with real-time feedback
- **Added**: Error summary boxes and character counters for better UX
- **Improved**: File upload handling with better FormData construction
- **Updated**: Documentation and README with current features and setup
- **Fixed**: Port configuration consistency between frontend and backend

### Version 1.0.0 (Initial Release)
- Complete LMS implementation with authentication, courses, and real-time features
- Role-based access control for students, teachers, and admins
- File upload system for lessons, thumbnails, and profile images
- Live class scheduling and real-time notifications
- Assignment submission and progress tracking

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support & Documentation

- **Issues**: Report bugs or request features via [GitHub Issues](../../issues)
- **Documentation**: Check the wiki for detailed guides
- **Contact**: For direct support, contact the development team

## 🗒️ Project Notes

- **Routes and Controllers**: Unified approach where controller logic is contained within route files in `backend/routes/`
- **File Upload Handling**: All media files (videos, images, documents) use proper URL construction with `UPLOADS_BASE_URL` for cross-origin access
- **Database Seeding**: Should be done manually or through API endpoints
- **File Storage**: All uploads stored in organized `backend/uploads/` subdirectories (lessons/, profiles/, thumbnails/)
- **Logging**: Winston handles application logging with file rotation in `backend/logs/`
- **Real-time Features**: Socket.io enables bidirectional communication for notifications and live updates
- **Form Validation**: Comprehensive client-side validation with real-time feedback and error summaries
- **Error Handling**: Centralized error handling with user-friendly toast notifications
- **Security**: Helmet.js for HTTP security headers, rate limiting, and CORS configuration

---

**Version**: 1.3.0  
**Last Updated**: April 23, 2026  
**Status**: Production Ready
