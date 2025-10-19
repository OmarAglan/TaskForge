# Tasky - Task Tracking Web Application

A Vue.js + Express.js web application for tracking tasks and managing projects with bilingual support (English/Arabic).

Tasky is a Single Page Application (SPA) that allows users to register, login, create tasks, organize them into projects, and track their progress. The application features a modern UI with Material Design components and supports both LTR and RTL layouts.

## Table of Contents

- [Tasky - Task Tracking Web Application](#tasky---task-tracking-web-application)
  - [Table of Contents](#table-of-contents)
  - [Technology Stack](#technology-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
  - [Current Status](#current-status)
    - [✅ Completed Features](#-completed-features)
    - [🚧 In Progress](#-in-progress)
    - [❌ Not Yet Implemented](#-not-yet-implemented)
  - [Features](#features)
    - [Authentication](#authentication)
    - [User Interface](#user-interface)
    - [Task Management](#task-management)
    - [Project Management](#project-management)
    - [Dashboard](#dashboard)
  - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication-1)
    - [Tasks](#tasks)
    - [Projects](#projects)
    - [General](#general)
  - [Authentication](#authentication-2)
    - [Authentication Flow](#authentication-flow)
  - [Security Considerations](#security-considerations)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Clone the repository](#clone-the-repository)
    - [Install dependencies](#install-dependencies)
  - [Running the Application](#running-the-application)
    - [Separate Development](#separate-development)
  - [Environment Variables](#environment-variables)
  - [Project Structure](#project-structure)
  - [Contributing](#contributing)
    - [Code Style](#code-style)
  - [Installation](#installation-1)
    - [Clone the repository](#clone-the-repository-1)
    - [Install dependencies](#install-dependencies-1)
  - [Running the application](#running-the-application-1)

## Technology Stack

### Frontend
- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite
- **UI Library:** Vuetify 3 with Material Design Icons
- **State Management:** Pinia
- **Routing:** Vue Router 4
- **HTTP Client:** Axios
- **Internationalization:** Vue-i18n (English & Arabic with RTL support)
- **Validation:** Vuelidate
- **Testing:** Vitest

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** SQLite
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Validation:** Joi
- **Development:** Nodemon

## Current Status

**Project Completion: ~65%**

### ✅ Completed Features
- User registration with validation
- User authentication with JWT
- Session management with localStorage persistence
- Bilingual UI (English/Arabic) with RTL support
- Theme switching (dark/light mode)
- Responsive design
- Authentication middleware for protected routes
- Task management with full CRUD operations
- Project management with full CRUD operations
- Dashboard with real-time statistics
- Task status updates
- Task priority levels
- Due date tracking

### 🚧 In Progress
- Task filtering and search functionality
- Project management UI enhancements

### ❌ Not Yet Implemented
- Multi-user task assignment
- Task categories and tags
- Notifications system
- Data export functionality

## Features

### Authentication
- User registration with password validation
- Secure login with JWT tokens
- Persistent sessions across page refreshes
- Automatic logout on token expiration
- Protected routes with authentication middleware

### User Interface
- Modern Material Design with Vuetify
- Dark/Light theme toggle
- Responsive layout for mobile and desktop
- Bilingual support (English/Arabic)
- RTL layout support for Arabic

### Task Management
- Create, read, update, delete tasks
- Organize tasks into projects
- Track task status (todo, in progress, completed, blocked)
- Set task priorities (low, medium, high, urgent)
- Add due dates with overdue warnings
- Quick status updates from task cards

### Project Management
- Create, read, update, delete projects
- Assign colors to projects for visual organization
- View task statistics per project
- Project-based task filtering

### Dashboard
- Real-time task statistics
- Completion progress tracking
- Tasks by status and priority breakdowns
- Recent tasks display
- Overdue tasks warnings

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Authenticate user and return JWT token

### Tasks
- `GET /tasks` - Get all tasks for authenticated user
- `GET /tasks/:id` - Get a specific task
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task
- `PATCH /tasks/:id/status` - Update task status only

### Projects
- `GET /projects` - Get all projects for authenticated user
- `GET /projects/:id` - Get a specific project
- `POST /projects` - Create a new project
- `PUT /projects/:id` - Update a project
- `DELETE /projects/:id` - Delete a project
- `GET /projects/:id/tasks` - Get all tasks in a project

### General
- `GET /` - Server status/hello world
- `GET /status` - Server status check

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Registration:** Users register with username and password
2. **Login:** Credentials are verified and a JWT token is issued
3. **Token Storage:** Token is stored in localStorage for persistence
4. **API Requests:** Token is automatically included in Authorization header
5. **Token Expiration:** Users are automatically logged out when tokens expire

### Authentication Flow

```javascript
// Login request
POST /login
{
  "username": "john_doe",
  "password": "securePassword123"
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
```

## Security Considerations

- **Password Storage:** Passwords are hashed using bcrypt (10 salt rounds)
- **JWT Security:** Tokens have expiration and are verified on protected routes
- **Input Validation:** Joi validation for all API inputs
- **CORS:** Configured for cross-origin requests
- **Future Enhancements:** Rate limiting, CSRF protection, input sanitization

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Clone the repository

```bash
git clone https://github.com/Omaranwa/Tracking-App.git
cd Tracking-App
```

### Install dependencies

Install dependencies for the root, client, and server:

```bash
npm install          # Root dependencies (concurrently)
cd client && npm install && cd ..
cd server && npm install && cd ..
```

## Running the Application

To run both the client and server concurrently for development, run the following command from the **root project directory**:

```bash
npm run dev
```

This will:
- Start the backend server (usually on port 8081)
- Start the frontend development server (usually on port 5173)
- Open the application in your browser

### Separate Development

If you prefer to run the client and server separately:

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

## Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=8081
NODE_ENV=development
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
DB_NAME=tracker
DB_USER=tracker
DB_PASS=tracker
DIALECT=sqlite
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:8081
```

## Project Structure

```
Tracking-App/
├── client/                      # Vue.js Frontend
│   ├── src/
│   │   ├── assets/             # Images, styles, icons
│   │   ├── components/         # Reusable components (TaskCard, TaskForm)
│   │   ├── locales/            # i18n files (en.json, ar.json)
│   │   ├── router/             # Vue Router configuration
│   │   ├── services/           # API services (Api, AuthenticationService, TaskService, ProjectService)
│   │   ├── stores/             # Pinia stores (auth, tasks, projects)
│   │   ├── views/              # Page components (HomeView, LoginView, RegisterView, AboutView)
│   │   ├── App.vue             # Root component
│   │   └── main.js             # App initialization
│   └── package.json            # Frontend dependencies
│
├── server/                      # Express.js Backend
│   ├── src/
│   │   ├── config/             # Configuration
│   │   ├── controllers/        # Business logic (AuthenticationController, TaskController, ProjectController)
│   │   ├── middleware/         # Custom middleware (authentication)
│   │   ├── models/             # Sequelize models (User, Task, Project)
│   │   ├── policies/           # Validation middleware (AuthenticationControllerPolicy, TaskControllerPolicy, ProjectControllerPolicy)
│   │   ├── app.js              # Express app setup
│   │   └── routes.js           # Route definitions
│   └── package.json            # Backend dependencies
│
├── package.json                 # Root package with concurrently script
└── README.md                    # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use ESLint and Prettier for code formatting
- Follow Vue.js style guide
- Write meaningful commit messages
- Add comments for complex logic

## Installation

### Clone the repository

```git clone https://github.com/Omaranwa/Tracking-App.git```

### Install dependencies

Install dependencies for the root, client, and server:

```bash
npm install # Installs root dependencies (like concurrently)
cd client && npm install && cd ..
cd server && npm install && cd ..
```

## Running the application

To run both the client and server concurrently for development, run the following command from the **root project directory**:

```bash
npm run dev
```

This will:
*   Start the backend server (usually on port 8081).
*   Start the frontend development server (usually on a port like 5173) and provide a link to open in your browser.

*(Previously, you would run `npm start` in the `server` directory and `npm run dev` in the `client` directory in separate terminals. The `npm run dev` command in the root now handles both.)*