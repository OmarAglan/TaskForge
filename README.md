# Tasky - Task Tracking Web Application

> ⚠️ This root README is legacy and does not reflect the current TaskForge stack.
>
> For up-to-date setup and deployment:
> - `backend/README.md`
> - `frontend/README.md`
> - `DEPLOYMENT.md`

A modern, full-stack web application for tracking tasks and managing projects with bilingual support (English/Arabic).

![Project Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Completion](https://img.shields.io/badge/Completion-80--85%25-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Current Status](#current-status)
- [Features](#features)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Security](#security)
- [Contributing](#contributing)
- [Roadmap](#roadmap)

## 🎯 Overview

Tasky is a Single Page Application (SPA) that allows users to:

- ✅ Register and authenticate securely
- ✅ Create and manage tasks with priorities and due dates
- ✅ Organize tasks into color-coded projects
- ✅ Track progress with a real-time dashboard
- ✅ Switch between English and Arabic languages (with RTL support)
- ✅ Toggle between dark and light themes

The application is built with Vue.js 3 on the frontend and Express.js on the backend, using SQLite for development database and JWT for secure authentication.

## 🛠️ Technology Stack

### Frontend

- **Framework:** Vue.js 3.4.15 (Composition API with `<script setup>`)
- **Build Tool:** Vite 6.2.5
- **UI Library:** Vuetify 3.5.11 with Material Design Icons
- **State Management:** Pinia 2.1.7
- **Routing:** Vue Router 4.2.5
- **HTTP Client:** Axios 1.6.7
- **Internationalization:** Vue-i18n 9.14.4 (English & Arabic with RTL)
- **Validation:** Vuelidate 2.0.3
- **Testing:** Vitest 3.1.1
- **Code Quality:** ESLint, Prettier

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js 4.18.3
- **ORM:** Sequelize 6.37.7
- **Database:** SQLite 3 (development), PostgreSQL/MySQL (planned for production)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt 6.0.0
- **Validation:** Joi 18.0.1
- **Middleware:** CORS 2.8.5, Morgan 1.10.1, body-parser 2.2.0
- **Development:** Nodemon 3.1.10

### Development Tools

- **Concurrency:** Concurrently 9.2.1 (runs client + server simultaneously)
- **Version Control:** Git

## 📊 Current Status

**Project Completion: ~80-85%**

### ✅ Completed Features (100%)

**Authentication System:**

- ✅ User registration with password validation
- ✅ User login with JWT tokens
- ✅ Session persistence across page refreshes
- ✅ Authentication middleware for protected routes
- ✅ Automatic logout on token expiration
- ✅ Secure password hashing with bcrypt

**Backend API:**

- ✅ Complete Task CRUD operations (Create, Read, Update, Delete)
- ✅ Complete Project CRUD operations
- ✅ Task status management (todo, in_progress, completed, blocked)
- ✅ Task priority levels (low, medium, high, urgent)
- ✅ Due date tracking with overdue detection
- ✅ Project-task relationships
- ✅ Filtering and pagination support
- ✅ Input validation with Joi

**Frontend Components:**

- ✅ TaskCard component with full functionality
- ✅ TaskForm component for create/edit
- ✅ Functional dashboard with real-time statistics
- ✅ Task and Project Pinia stores
- ✅ Loading states and error handling
- ✅ Responsive design for mobile and desktop

**User Interface:**

- ✅ Bilingual support (English/Arabic)
- ✅ RTL layout support for Arabic
- ✅ Dark/Light theme toggle
- ✅ Material Design with Vuetify
- ✅ Mobile-responsive navigation

**Dashboard:**

- ✅ Real-time task statistics (total, completed, pending, overdue)
- ✅ Completion progress tracking
- ✅ Tasks by status breakdown
- ✅ Tasks by priority breakdown
- ✅ Recent tasks display
- ✅ Quick task creation

**Real-Time Features (Phase 8 - NestJS & React):**

- ✅ WebSocket (Socket.io) backend implementation
- ✅ WebSocket Gateway with JWT authentication
- ✅ WebSocket Service with emit methods
- ✅ Notifications module
- ✅ Tasks/Teams real-time event integration
- ✅ Room-based broadcasting
- ✅ Frontend WebSocket service with auto-reconnect
- ✅ useWebSocket, useRealtimeTasks, useRealtimeTeams hooks
- ✅ NotificationBell, NotificationsList, NotificationItem components
- ✅ OnlineIndicator, UserPresence components
- ✅ ConnectionStatus indicator

### 🚧 In Progress (30%)

- 🔄 Dedicated Tasks list view (with search, filtering, sorting)
- 🔄 Projects management view
- 🔄 ProjectCard and ProjectForm components
- 🔄 Advanced filtering UI
- 🔄 Task and Project detail pages

### ❌ Not Yet Implemented (0%)

- ❌ Testing suite (unit, integration, E2E)
- ❌ Database migration system
- ❌ Search functionality in UI
- ❌ Data export (CSV/JSON)
- ❌ User profile/settings page
- ❌ Password reset functionality
- ❌ Email notifications
- ❌ Task categories and tags
- ❌ Multi-user task assignment
- ❌ Kanban board view
- ❌ Calendar view

## ✨ Features

### Authentication

- **Secure Registration:** Username and password with validation rules
- **JWT-based Login:** Token-based authentication with expiration
- **Session Persistence:** Auth state persists across browser sessions
- **Protected Routes:** Dashboard and features require authentication
- **Auto-logout:** Automatic logout when token expires

### Task Management

- **Full CRUD:** Create, read, update, and delete tasks
- **Status Tracking:** Todo, In Progress, Completed, Blocked
- **Priority Levels:** Low, Medium, High, Urgent
- **Due Dates:** Set due dates with overdue warnings
- **Project Assignment:** Organize tasks into projects
- **Quick Updates:** Change status without opening full form

### Project Management

- **Project Organization:** Group related tasks together
- **Color Coding:** Assign colors for visual identification
- **Task Statistics:** View task counts per project
- **Relationship Management:** Tasks linked to projects

### Dashboard

- **Statistics Cards:** Total, completed, pending, overdue tasks
- **Progress Tracking:** Visual completion percentage
- **Status Breakdown:** Tasks grouped by status
- **Priority Breakdown:** Tasks grouped by priority
- **Recent Tasks:** Quick view of latest 5 tasks
- **Empty States:** Helpful prompts when no tasks exist

### User Interface

- **Modern Design:** Material Design with Vuetify 3
- **Responsive Layout:** Works on mobile, tablet, and desktop
- **Theme Toggle:** Switch between dark and light modes
- **Bilingual:** Full English and Arabic translations
- **RTL Support:** Proper right-to-left layout for Arabic
- **Loading States:** Visual feedback during operations

## 🚀 Installation

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- **Git**

### Clone the Repository

```bash
git clone https://github.com/Omaranwa/Tracking-App.git
cd Tracking-App
```

### Install Dependencies

Install dependencies for root, client, and server:

```bash
# Root dependencies (concurrently)
npm install

# Client dependencies
cd client
npm install
cd ..

# Server dependencies
cd server
npm install
cd ..
```

Or use this one-liner:

```bash
npm install && cd client && npm install && cd .. && cd server && npm install && cd ..
```

### Environment Variables

Create `.env` file in the `server` directory:

```env
PORT=8081
NODE_ENV=development
JWT_SECRET=your-super-secret-key-minimum-32-characters-change-in-production
JWT_EXPIRES_IN=7d
DB_NAME=tracker
DB_USER=tracker
DB_PASS=tracker
DIALECT=sqlite
```

Create `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:8081
```

**Note:** See `server/.env.example` for reference.

## 🏃 Running the Application

### Development Mode (Recommended)

Run both client and server concurrently from the **root directory**:

```bash
npm run dev
```

This will:

- Start the backend server on `http://localhost:8081`
- Start the frontend dev server on `http://localhost:5173` (or next available port)
- Automatically open the application in your browser

### Separate Development

If you prefer to run client and server in separate terminals:

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

### Production Build

```bash
# Build frontend for production
cd client
npm run build

# Build will be in client/dist directory
```

## 🔌 API Endpoints

All protected endpoints require JWT token in Authorization header: `Bearer <token>`

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and receive JWT token |

### Tasks (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all user's tasks (supports filters & pagination) |
| GET | `/tasks/:id` | Get specific task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update an existing task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/status` | Update only task status |

**Query Parameters for GET /tasks:**

- `status` - Filter by status (todo, in_progress, completed, blocked)
- `priority` - Filter by priority (low, medium, high, urgent)
- `projectId` - Filter by project ID
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 10)

### Projects (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | Get all user's projects |
| GET | `/projects/:id` | Get specific project by ID |
| POST | `/projects` | Create a new project |
| PUT | `/projects/:id` | Update an existing project |
| DELETE | `/projects/:id` | Delete a project (only if no tasks) |
| GET | `/projects/:id/tasks` | Get all tasks in a project |

### General (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server hello world |
| GET | `/status` | Server status check |

### Example API Request

```javascript
// Login
POST http://localhost:8081/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "john_doe"
    }
  }
}

// Create Task (with token)
POST http://localhost:8081/tasks
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-10-25",
  "projectId": 1
}
```

## 📁 Project Structure

```
Tracking-App/
├── client/                      # Vue.js Frontend
│   ├── src/
│   │   ├── assets/             # Images, styles, icons
│   │   ├── components/         # Reusable components
│   │   │   ├── TaskCard.vue    # Task display component ✅
│   │   │   ├── TaskForm.vue    # Task create/edit form ✅
│   │   │   └── icons/          # Icon components
│   │   ├── locales/            # i18n translations
│   │   │   ├── en.json         # English translations ✅
│   │   │   └── ar.json         # Arabic translations ✅
│   │   ├── router/             # Vue Router config
│   │   │   └── index.js        # Route definitions ✅
│   │   ├── services/           # API communication
│   │   │   ├── Api.js          # Axios instance ✅
│   │   │   ├── AuthenticationService.js ✅
│   │   │   ├── TaskService.js  # Task API calls ✅
│   │   │   └── ProjectService.js # Project API calls ✅
│   │   ├── stores/             # Pinia state management
│   │   │   ├── auth.js         # Auth store ✅
│   │   │   ├── tasks.js        # Task store ✅
│   │   │   └── projects.js     # Project store ✅
│   │   ├── views/              # Page components
│   │   │   ├── HomeView.vue    # Dashboard ✅
│   │   │   ├── LoginView.vue   # Login page ✅
│   │   │   ├── RegisterView.vue # Register page ✅
│   │   │   └── AboutView.vue   # About page (minimal)
│   │   ├── App.vue             # Root component ✅
│   │   └── main.js             # App initialization ✅
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
│
├── server/                      # Express.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── config.js       # App configuration ✅
│   │   ├── controllers/        # Business logic
│   │   │   ├── AuthenticationController.js ✅
│   │   │   ├── TaskController.js # Task CRUD ✅
│   │   │   └── ProjectController.js # Project CRUD ✅
│   │   ├── middleware/
│   │   │   └── authentication.js # JWT middleware ✅
│   │   ├── models/             # Sequelize models
│   │   │   ├── index.js        # Model initialization ✅
│   │   │   ├── User.js         # User model ✅
│   │   │   ├── Task.js         # Task model ✅
│   │   │   └── Project.js      # Project model ✅
│   │   ├── policies/           # Validation middleware
│   │   │   ├── AuthenticationControllerPolicy.js ✅
│   │   │   ├── TaskControllerPolicy.js ✅
│   │   │   └── ProjectControllerPolicy.js ✅
│   │   ├── app.js              # Express app setup ✅
│   │   └── routes.js           # Route definitions ✅
│   ├── package.json            # Backend dependencies
│   └── .env.example            # Environment variables template
│
├── package.json                 # Root package (concurrently)
├── README.md                    # This file
└── .gitignore                  # Git ignore rules
```

## 🔐 Authentication

### Authentication Flow

1. **Registration:**
   - User provides username and password
   - Password is validated (min 8 chars, must contain uppercase, lowercase, and number)
   - Password is hashed with bcrypt (10 salt rounds)
   - User record is created in database

2. **Login:**
   - User provides credentials
   - Password is verified using bcrypt.compare()
   - JWT token is generated with 7-day expiration
   - Token is sent to client

3. **Token Storage:**
   - Client stores token in localStorage
   - Auth store maintains login state

4. **Protected Routes:**
   - Client router checks auth status before allowing access
   - API requests include token in Authorization header
   - Server middleware verifies token for protected endpoints

5. **Token Expiration:**
   - Expired tokens are rejected by server
   - Client automatically logs out user

### Password Requirements

- Minimum 8 characters
- Maximum 32 characters
- Must contain at least one lowercase letter
- Must contain at least one uppercase letter
- Must contain at least one number

### Username Requirements

- 6-30 alphanumeric characters
- Must be unique

## 🔒 Security

Current security measures:

- ✅ **Password Hashing:** bcrypt with 10 salt rounds
- ✅ **JWT Authentication:** Tokens with expiration
- ✅ **Input Validation:** Joi validation on all inputs
- ✅ **CORS:** Configured for cross-origin requests
- ✅ **Auth Middleware:** Protects sensitive endpoints

Planned security enhancements:

- ⏳ Rate limiting (express-rate-limit)
- ⏳ Security headers (Helmet.js)
- ⏳ Input sanitization (XSS protection)
- ⏳ CSRF protection
- ⏳ Environment variable validation
- ⏳ SQL injection prevention (enhanced)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Frontend:** Follow Vue.js style guide, use ESLint and Prettier
- **Backend:** Use ESLint, follow Airbnb style guide
- **Commits:** Write clear, meaningful commit messages
- **Comments:** Add JSDoc comments for functions
- **Testing:** Write tests for new features (when testing is set up)

## 🗺️ Roadmap

### Phase 8: Real-Time Features (Completed)

- [x] WebSocket backend with Socket.io
- [x] JWT authentication for WebSocket
- [x] Real-time task updates
- [x] Real-time team updates
- [x] Notifications system
- [x] Presence indicators

### Phase 9: Analytics Dashboard (Not Started)

- [ ] Tasks list view with filtering and sorting
- [ ] Projects management view
- [ ] Task and Project detail pages
- [ ] Search functionality in UI
- [ ] Navigation menu updates

### Phase 5: Testing & Quality (Not Started)

- [ ] Backend unit tests (Jest)
- [ ] Frontend unit tests (Vitest)
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests (Cypress/Playwright)
- [ ] CI/CD pipeline

### Phase 6: Production Readiness (Not Started)

- [ ] Database migrations system
- [ ] PostgreSQL/MySQL migration
- [ ] Rate limiting and security hardening
- [ ] Performance optimization
- [ ] API documentation (Swagger)
- [ ] Deployment documentation

### Future Enhancements

- [ ] Task categories and tags
- [ ] Multi-user collaboration
- [ ] Email notifications
- [ ] Data export (CSV/JSON)
- [ ] Kanban board view
- [ ] Calendar view
- [ ] File attachments
- [ ] Task comments
- [ ] User profile management
- [ ] Password reset functionality
- [ ] Mobile app (React Native)

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Omar Anwar**

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Vuetify team for the Material Design components
- Express.js community
- All open-source contributors

---

**Status:** Active Development | **Version:** 0.8.0 | **Last Updated:** October 2025
