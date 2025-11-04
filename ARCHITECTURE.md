# TaskForge - Full Stack Project Management Application

## Technical Architecture Document

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Status:** Architecture Design Phase  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [System Architecture](#system-architecture)
5. [Database Schema](#database-schema)
6. [API Design](#api-design)
7. [Authentication & Authorization](#authentication--authorization)
8. [Frontend Architecture](#frontend-architecture)
9. [Real-Time Features](#real-time-features)
10. [Analytics System](#analytics-system)
11. [Docker Strategy](#docker-strategy)
12. [CI/CD Pipeline](#cicd-pipeline)
13. [Technology Decisions](#technology-decisions)
14. [Security Considerations](#security-considerations)
15. [Deployment Architecture](#deployment-architecture)
16. [Scalability & Performance](#scalability--performance)
17. [Development Workflow](#development-workflow)

---

## Executive Summary

TaskForge is an enterprise-grade project management application designed to showcase modern full-stack development practices. The application enables teams to collaborate on tasks with real-time updates, role-based access control, and comprehensive analytics.

### Core Features

- ✅ Multi-user team collaboration
- ✅ Real-time task updates via WebSockets
- ✅ Role-based access control (Admin, Team Lead, Member)
- ✅ Advanced analytics and reporting
- ✅ Containerized deployment
- ✅ CI/CD automation
- ✅ Scalable cloud architecture

### Architecture Goals

1. **Modularity**: Clean separation of concerns
2. **Scalability**: Horizontal scaling capability
3. **Maintainability**: Well-documented, testable code
4. **Security**: Industry-standard authentication and authorization
5. **Performance**: Optimized for real-time interactions
6. **Developer Experience**: Efficient development workflow

---

## Technology Stack

### Backend

- **Framework**: NestJS 10.x (TypeScript)
- **Runtime**: Node.js 20.x LTS
- **Database ORM**: TypeORM 0.3.x
- **Database**: PostgreSQL 15.x
- **Authentication**: Passport.js + JWT
- **Real-time**: Socket.io
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest

### Frontend

- **Framework**: React 18.x (TypeScript)
- **Build Tool**: Vite 5.x
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Charts**: Chart.js + react-chartjs-2
- **Form Management**: React Hook Form + Yup
- **Testing**: Vitest, React Testing Library

### DevOps & Infrastructure

- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud Provider**: AWS
  - Compute: ECS (Elastic Container Service) or EC2
  - Database: RDS (PostgreSQL)
  - Load Balancer: Application Load Balancer (ALB)
  - Storage: S3 (for static assets)
  - Container Registry: ECR
- **Reverse Proxy**: Nginx
- **Monitoring**: CloudWatch (AWS)
- **Environment Management**: dotenv

### Development Tools

- **Code Quality**: ESLint, Prettier
- **Git Hooks**: Husky
- **Documentation**: Markdown, Swagger UI
- **API Testing**: Postman/Thunder Client

---

## Project Structure

### Monorepo Layout

```
TaskForge/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       └── deploy.yml
│
├── backend/                          # NestJS Application
│   ├── src/
│   │   ├── auth/                     # Authentication module
│   │   │   ├── guards/               # Auth guards (JWT, Roles)
│   │   │   ├── strategies/           # Passport strategies
│   │   │   ├── decorators/           # Custom decorators
│   │   │   ├── dto/                  # Data transfer objects
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── users/                    # Users module
│   │   │   ├── entities/             # User entity
│   │   │   ├── dto/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   │
│   │   ├── teams/                    # Teams module
│   │   │   ├── entities/             # Team, TeamMember entities
│   │   │   ├── dto/
│   │   │   ├── teams.controller.ts
│   │   │   ├── teams.service.ts
│   │   │   └── teams.module.ts
│   │   │
│   │   ├── tasks/                    # Tasks module
│   │   │   ├── entities/             # Task entity
│   │   │   ├── dto/
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── tasks.gateway.ts      # WebSocket gateway
│   │   │   └── tasks.module.ts
│   │   │
│   │   ├── analytics/                # Analytics module
│   │   │   ├── entities/             # ActivityLog entity
│   │   │   ├── dto/
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── analytics.module.ts
│   │   │
│   │   ├── notifications/            # Notifications module
│   │   │   ├── notifications.gateway.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── notifications.module.ts
│   │   │
│   │   ├── common/                   # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── filters/              # Exception filters
│   │   │   ├── interceptors/         # Response interceptors
│   │   │   ├── pipes/                # Validation pipes
│   │   │   └── types/                # Shared types/enums
│   │   │
│   │   ├── database/                 # Database configuration
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   └── database.module.ts
│   │   │
│   │   ├── config/                   # Configuration
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── app.module.ts             # Root module
│   │   └── main.ts                   # Application entry
│   │
│   ├── test/                         # E2E tests
│   ├── .env.example
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                         # React Application
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── common/               # Generic components
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Loader/
│   │   │   │   └── ErrorBoundary/
│   │   │   │
│   │   │   ├── layout/               # Layout components
│   │   │   │   ├── Header/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── Footer/
│   │   │   │   └── MainLayout/
│   │   │   │
│   │   │   ├── tasks/                # Task components
│   │   │   │   ├── TaskCard/
│   │   │   │   ├── TaskForm/
│   │   │   │   ├── TaskList/
│   │   │   │   ├── TaskDetail/
│   │   │   │   └── TaskFilters/
│   │   │   │
│   │   │   ├── teams/                # Team components
│   │   │   │   ├── TeamCard/
│   │   │   │   ├── TeamForm/
│   │   │   │   ├── TeamMemberList/
│   │   │   │   └── MemberInvite/
│   │   │   │
│   │   │   └── analytics/            # Analytics components
│   │   │       ├── ChartWrapper/
│   │   │       ├── StatCard/
│   │   │       ├── BurndownChart/
│   │   │       ├── ProductivityChart/
│   │   │       └── CompletionTrends/
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── ForgotPassword.tsx
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── Tasks/
│   │   │   │   ├── TasksPage.tsx
│   │   │   │   └── TaskDetailPage.tsx
│   │   │   ├── Teams/
│   │   │   │   ├── TeamsPage.tsx
│   │   │   │   └── TeamDetailPage.tsx
│   │   │   ├── Analytics/
│   │   │   │   └── AnalyticsPage.tsx
│   │   │   └── Profile/
│   │   │       └── ProfilePage.tsx
│   │   │
│   │   ├── services/                 # API services
│   │   │   ├── api.ts                # Axios instance
│   │   │   ├── auth.service.ts
│   │   │   ├── users.service.ts
│   │   │   ├── teams.service.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── socket.service.ts
│   │   │
│   │   ├── stores/                   # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── tasksStore.ts
│   │   │   ├── teamsStore.ts
│   │   │   ├── notificationsStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useTasks.ts
│   │   │   ├── useTeams.ts
│   │   │   ├── useSocket.ts
│   │   │   ├── usePermissions.ts
│   │   │   └── useAnalytics.ts
│   │   │
│   │   ├── types/                    # TypeScript types
│   │   │   ├── auth.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── team.types.ts
│   │   │   ├── task.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── routes/                   # Route configuration
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── RoleBasedRoute.tsx
│   │   │   └── routes.tsx
│   │   │
│   │   ├── theme/                    # MUI theme
│   │   │   ├── theme.ts
│   │   │   └── overrides.ts
│   │   │
│   │   ├── App.tsx                   # Root component
│   │   ├── main.tsx                  # Application entry
│   │   └── vite-env.d.ts
│   │
│   ├── public/
│   ├── .env.example
│   ├── .eslintrc.cjs
│   ├── .prettierrc
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml                # Local development
├── docker-compose.prod.yml           # Production deployment
├── nginx.conf                        # Nginx configuration
├── .gitignore
├── .prettierrc
├── .editorconfig
├── README.md
└── ARCHITECTURE.md                   # This document
```

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    React Application (Vite)                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │ │
│  │  │   Pages      │  │  Components  │  │  Zustand Stores      │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘ │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │ │
│  │  │ HTTP Client  │  │ Socket.io    │  │  Chart.js Visualizer │ │ │
│  │  │  (Axios)     │  │   Client     │  │                      │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS/WSS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER (AWS ALB)                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         REVERSE PROXY (Nginx)                        │
│           SSL Termination │ Request Routing │ Static Assets          │
└─────────────────────────────────────────────────────────────────────┘
                        │                            │
                        │                            │
        ┌───────────────┴────────────┐               │
        │                            │               │
        ▼                            ▼               ▼
┌─────────────────┐          ┌─────────────────┐  ┌──────────────┐
│  NestJS API     │          │  WebSocket      │  │   Static     │
│   (REST API)    │◄────────►│   Gateway       │  │   Assets     │
│                 │          │  (Socket.io)    │  │   (S3/Nginx) │
└─────────────────┘          └─────────────────┘  └──────────────┘
        │                            │
        │     ┌──────────────────────┘
        │     │
        ▼     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │   Auth     │  │   Teams    │  │   Tasks    │  │  Analytics   │  │
│  │  Module    │  │  Module    │  │  Module    │  │   Module     │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │   Users    │  │Notifications│ │   Common   │  │   Database   │  │
│  │  Module    │  │   Module    │  │   Module   │  │   Module     │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ TypeORM
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER (AWS RDS)                         │
│                     PostgreSQL 15.x (Primary)                        │
│                                                                       │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────┐  ┌─────────────────┐   │
│  │Users │  │Teams │  │Tasks │  │TeamMembers│ │  ActivityLogs   │   │
│  └──────┘  └──────┘  └──────┘  └──────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Request Flow

#### 1. **Standard REST API Request**

```
Client → ALB → Nginx → NestJS Controller → Service → Repository → PostgreSQL
                                                                        │
PostgreSQL → Repository → Service → Controller → Nginx → ALB → Client ←┘
```

#### 2. **WebSocket Real-Time Update**

```
Client Action → HTTP Request → NestJS Service → Database Update
                                      │
                                      ├──→ Emit WebSocket Event
                                      │
All Connected Clients ←───────────────┘
```

#### 3. **Authentication Flow**

```
Login Request → Auth Controller → Auth Service → Validate Credentials
                                                          │
                                                          ▼
                                              Generate JWT Access Token
                                              Generate JWT Refresh Token
                                                          │
                                                          ▼
Client Storage ←────────────────── Return Tokens & User Data

Subsequent Requests:
Request + JWT → JWT Guard → Validate Token → Extract User → Allow Access
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐
│       Users         │
├─────────────────────┤
│ id (PK)             │◄─────────────┐
│ email (unique)      │              │
│ username (unique)   │              │
│ password_hash       │              │
│ first_name          │              │
│ last_name           │              │
│ avatar_url          │              │
│ created_at          │              │
│ updated_at          │              │
└─────────────────────┘              │
         │                           │
         │ 1                         │
         │                           │
         │ N                         │
         │                           │
┌────────▼────────────┐              │
│   TeamMembers       │              │
├─────────────────────┤              │
│ id (PK)             │              │
│ team_id (FK)        │───┐          │
│ user_id (FK)        │   │          │
│ role (enum)         │   │          │
│ joined_at           │   │          │
└─────────────────────┘   │          │
         │                │          │
         │ N              │ N        │
         │                │          │
         │ 1              │          │
         │                │          │
┌────────▼────────────┐   │          │
│       Teams         │◄──┘          │
├─────────────────────┤              │
│ id (PK)             │              │
│ name                │              │
│ description         │              │
│ owner_id (FK)       │──────────────┘
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ 1
         │
         │ N
         │
┌────────▼────────────┐
│       Tasks         │
├─────────────────────┤
│ id (PK)             │
│ title               │
│ description         │
│ status (enum)       │
│ priority (enum)     │
│ team_id (FK)        │
│ assigned_to (FK)    │──────┐
│ created_by (FK)     │──────┼────────┐
│ due_date            │      │        │
│ completed_at        │      │        │
│ created_at          │      │        │
│ updated_at          │      │        │
└─────────────────────┘      │        │
         │                   │        │
         │ 1                 │ N      │ N
         │                   │        │
         │ N                 │        │
         │                   │        │
┌────────▼────────────┐      │        │
│   ActivityLogs      │      │        │
├─────────────────────┤      │        │
│ id (PK)             │      │        │
│ task_id (FK)        │      │        │
│ user_id (FK)        │──────┴────────┘
│ action_type (enum)  │
│ old_value (json)    │
│ new_value (json)    │
│ created_at          │
└─────────────────────┘
```

### Database Schema Details

#### **Users Table**

```typescript
{
  id: UUID PRIMARY KEY,
  email: VARCHAR(255) UNIQUE NOT NULL,
  username: VARCHAR(50) UNIQUE NOT NULL,
  password_hash: VARCHAR(255) NOT NULL,
  first_name: VARCHAR(100),
  last_name: VARCHAR(100),
  avatar_url: VARCHAR(500),
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
}

// Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### **Teams Table**

```typescript
{
  id: UUID PRIMARY KEY,
  name: VARCHAR(100) NOT NULL,
  description: TEXT,
  owner_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
}

// Indexes
CREATE INDEX idx_teams_owner ON teams(owner_id);
```

#### **TeamMembers Table** (Junction Table)

```typescript
{
  id: UUID PRIMARY KEY,
  team_id: UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role: ENUM('admin', 'team_lead', 'member') DEFAULT 'member',
  joined_at: TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_team_user UNIQUE(team_id, user_id)
}

// Indexes
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);
```

#### **Tasks Table**

```typescript
{
  id: UUID PRIMARY KEY,
  title: VARCHAR(255) NOT NULL,
  description: TEXT,
  status: ENUM('todo', 'in_progress', 'in_review', 'completed', 'blocked') DEFAULT 'todo',
  priority: ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  team_id: UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  assigned_to: UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date: TIMESTAMP,
  completed_at: TIMESTAMP,
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
}

// Indexes
CREATE INDEX idx_tasks_team ON tasks(team_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

#### **ActivityLogs Table**

```typescript
{
  id: UUID PRIMARY KEY,
  task_id: UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type: ENUM(
    'task_created',
    'task_updated',
    'task_deleted',
    'task_assigned',
    'status_changed',
    'priority_changed',
    'comment_added'
  ) NOT NULL,
  old_value: JSONB,
  new_value: JSONB,
  created_at: TIMESTAMP DEFAULT NOW()
}

// Indexes
CREATE INDEX idx_activity_logs_task ON activity_logs(task_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
```

### Database Relationships Summary

1. **Users ↔ Teams**: Many-to-Many via TeamMembers
2. **Teams → Tasks**: One-to-Many (cascade delete)
3. **Users → Tasks** (assigned_to): One-to-Many (set null on delete)
4. **Users → Tasks** (created_by): One-to-Many (cascade delete)
5. **Tasks → ActivityLogs**: One-to-Many (cascade delete)
6. **Users → ActivityLogs**: One-to-Many (cascade delete)

---

## API Design

### REST API Endpoints

#### **Authentication Endpoints** (Public)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Register new user | `{ email, username, password, firstName, lastName }` | `{ user, tokens }` |
| POST | `/api/auth/login` | Login user | `{ email, password }` | `{ user, tokens }` |
| POST | `/api/auth/refresh` | Refresh access token | `{ refreshToken }` | `{ accessToken }` |
| POST | `/api/auth/logout` | Logout user | - | `{ success: true }` |
| GET | `/api/auth/me` | Get current user | - | `{ user }` |

#### **Users Endpoints** (Protected)

| Method | Endpoint | Description | Access | Response |
|--------|----------|-------------|--------|----------|
| GET | `/api/users/profile` | Get own profile | Authenticated | `{ user }` |
| PATCH | `/api/users/profile` | Update own profile | Authenticated | `{ user }` |
| POST | `/api/users/upload-avatar` | Upload avatar | Authenticated | `{ avatarUrl }` |
| GET | `/api/users/:id` | Get user by ID | Team Member | `{ user }` |

#### **Teams Endpoints** (Protected)

| Method | Endpoint | Description | Access | Response |
|--------|----------|-------------|--------|----------|
| GET | `/api/teams` | Get user's teams | Authenticated | `{ teams[] }` |
| POST | `/api/teams` | Create team | Authenticated | `{ team }` |
| GET | `/api/teams/:id` | Get team details | Team Member | `{ team }` |
| PATCH | `/api/teams/:id` | Update team | Admin/Owner | `{ team }` |
| DELETE | `/api/teams/:id` | Delete team | Owner | `{ success: true }` |
| GET | `/api/teams/:id/members` | Get team members | Team Member | `{ members[] }` |
| POST | `/api/teams/:id/members` | Add team member | Admin/Team Lead | `{ member }` |
| PATCH | `/api/teams/:id/members/:userId` | Update member role | Admin | `{ member }` |
| DELETE | `/api/teams/:id/members/:userId` | Remove member | Admin | `{ success: true }` |

#### **Tasks Endpoints** (Protected)

| Method | Endpoint | Description | Access | Response |
|--------|----------|-------------|--------|----------|
| GET | `/api/tasks` | Get all team tasks | Team Member | `{ tasks[], pagination }` |
| POST | `/api/tasks` | Create task | Team Member | `{ task }` |
| GET | `/api/tasks/:id` | Get task details | Team Member | `{ task }` |
| PATCH | `/api/tasks/:id` | Update task | Assignee/Creator/Admin | `{ task }` |
| DELETE | `/api/tasks/:id` | Delete task | Creator/Admin | `{ success: true }` |
| PATCH | `/api/tasks/:id/status` | Update status only | Assignee/Admin | `{ task }` |
| PATCH | `/api/tasks/:id/assign` | Assign task to user | Team Lead/Admin | `{ task }` |

**Query Parameters for GET `/api/tasks`:**

- `teamId` (required): Filter by team
- `status`: Filter by status (todo, in_progress, in_review, completed, blocked)
- `priority`: Filter by priority (low, medium, high, urgent)
- `assignedTo`: Filter by assigned user ID
- `search`: Search in title and description
- `sortBy`: Sort field (createdAt, dueDate, priority, status)
- `sortOrder`: asc or desc
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

#### **Analytics Endpoints** (Protected)

| Method | Endpoint | Description | Access | Response |
|--------|----------|-------------|--------|----------|
| GET | `/api/analytics/team/:teamId/overview` | Team overview stats | Team Member | `{ stats }` |
| GET | `/api/analytics/team/:teamId/completion-trends` | Completion trends | Team Member | `{ trends[] }` |
| GET | `/api/analytics/team/:teamId/productivity` | Team productivity | Team Lead/Admin | `{ productivity[] }` |
| GET | `/api/analytics/team/:teamId/burndown` | Sprint burndown | Team Member | `{ burndown[] }` |
| GET | `/api/analytics/user/:userId/stats` | User statistics | Self/Admin | `{ stats }` |

**Analytics Response Examples:**

```typescript
// Team Overview
{
  totalTasks: 150,
  completedTasks: 95,
  inProgressTasks: 35,
  blockedTasks: 5,
  todoTasks: 15,
  completionRate: 63.3,
  overdueTasksCount: 8,
  averageCompletionTime: 4.5, // days
  tasksByPriority: { low: 30, medium: 80, high: 30, urgent: 10 }
}

// Completion Trends (last 30 days)
[
  { date: '2025-01-01', completed: 5, created: 8 },
  { date: '2025-01-02', completed: 3, created: 5 },
  ...
]

// Team Productivity
[
  { userId: 'uuid', username: 'john_doe', tasksCompleted: 25, avgCompletionTime: 3.2 },
  ...
]

// Burndown Chart
{
  sprintStart: '2025-01-01',
  sprintEnd: '2025-01-14',
  totalPoints: 100,
  dataPoints: [
    { date: '2025-01-01', remaining: 100, ideal: 100 },
    { date: '2025-01-02', remaining: 93, ideal: 92.8 },
    ...
  ]
}
```

### API Response Format

**Success Response:**

```typescript
{
  success: true,
  data: { ... },
  message?: string
}
```

**Error Response:**

```typescript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human readable message',
    details?: { ... }
  }
}
```

**Paginated Response:**

```typescript
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8,
    hasNext: true,
    hasPrev: false
  }
}
```

---

## Authentication & Authorization

### Authentication Strategy

**JWT-based Authentication with Refresh Tokens**

1. **Access Token**: Short-lived (15 minutes)
   - Contains: userId, email, username
   - Used for API requests
   - Stored in memory or state management

2. **Refresh Token**: Long-lived (7 days)
   - Contains: userId, tokenId
   - Used to obtain new access tokens
   - Stored in httpOnly cookie (secure)

### Authorization - Role-Based Access Control (RBAC)

#### **Roles Hierarchy**

```
System Admin (Future)
    │
    └── Team Owner
            │
            ├── Team Admin
            │       │
            │       └── Team Lead
            │               │
            │               └── Member
```

#### **Role Definitions**

| Role | Team Creation | Team Settings | Add Members | Remove Members | Task CRUD | Assign Tasks | View Analytics |
|------|---------------|---------------|-------------|----------------|-----------|--------------|----------------|
| **Owner** | ✅ | ✅ Full | ✅ | ✅ All | ✅ | ✅ | ✅ Full |
| **Admin** | ❌ | ✅ Partial | ✅ | ✅ (not owner/admin) | ✅ | ✅ | ✅ Full |
| **Team Lead** | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ Team Only |
| **Member** | ❌ | ❌ | ❌ | ❌ | ✅ Own tasks | ❌ | ✅ Personal Only |

#### **Permission Matrix**

```typescript
// Permissions enum
enum Permission {
  // Team permissions
  TEAM_CREATE = 'team:create',
  TEAM_UPDATE = 'team:update',
  TEAM_DELETE = 'team:delete',
  TEAM_VIEW = 'team:view',
  
  // Member permissions
  MEMBER_ADD = 'member:add',
  MEMBER_REMOVE = 'member:remove',
  MEMBER_UPDATE_ROLE = 'member:update_role',
  MEMBER_VIEW = 'member:view',
  
  // Task permissions
  TASK_CREATE = 'task:create',
  TASK_UPDATE_ANY = 'task:update:any',
  TASK_UPDATE_OWN = 'task:update:own',
  TASK_DELETE_ANY = 'task:delete:any',
  TASK_DELETE_OWN = 'task:delete:own',
  TASK_ASSIGN = 'task:assign',
  TASK_VIEW = 'task:view',
  
  // Analytics permissions
  ANALYTICS_TEAM = 'analytics:team',
  ANALYTICS_USER = 'analytics:user'
}

// Role → Permissions mapping
const RolePermissions = {
  owner: [
    Permission.TEAM_UPDATE,
    Permission.TEAM_DELETE,
    Permission.MEMBER_ADD,
    Permission.MEMBER_REMOVE,
    Permission.MEMBER_UPDATE_ROLE,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE_ANY,
    Permission.TASK_DELETE_ANY,
    Permission.TASK_ASSIGN,
    Permission.ANALYTICS_TEAM,
    Permission.ANALYTICS_USER
  ],
  admin: [
    Permission.TEAM_UPDATE, // partial
    Permission.MEMBER_ADD,
    Permission.MEMBER_REMOVE, // except owner/admin
    Permission.MEMBER_UPDATE_ROLE, // except owner
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE_ANY,
    Permission.TASK_DELETE_ANY,
    Permission.TASK_ASSIGN,
    Permission.ANALYTICS_TEAM,
    Permission.ANALYTICS_USER
  ],
  team_lead: [
    Permission.MEMBER_ADD,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE_ANY,
    Permission.TASK_DELETE_OWN,
    Permission.TASK_ASSIGN,
    Permission.ANALYTICS_TEAM
  ],
  member: [
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE_OWN,
    Permission.TASK_DELETE_OWN,
    Permission.ANALYTICS_USER
  ]
};
```

### Authentication Implementation

#### **NestJS Guards**

```typescript
// JWT Auth Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// Roles Guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!requiredRoles) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId = request.params.teamId || request.body.teamId;
    
    // Check if user has required role in the team
    return this.hasRequiredRole(user, teamId, requiredRoles);
  }
}

// Permissions Guard
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<Permission[]>(
      'permissions',
      context.getHandler()
    );
    
    if (!requiredPermissions) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return this.userHasPermissions(user, requiredPermissions);
  }
}
```

#### **Usage in Controllers**

```typescript
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  
  @Post()
  @Roles(Role.MEMBER, Role.TEAM_LEAD, Role.ADMIN, Role.OWNER)
  @RequirePermissions(Permission.TASK_CREATE)
  createTask(@Body() createTaskDto: CreateTaskDto) {
    // Only team members and above can create tasks
  }
  
  @Delete(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  @RequirePermissions(Permission.TASK_DELETE_ANY)
  deleteTask(@Param('id') id: string) {
    // Only admins and owners can delete any task
  }
}
```

---

## Frontend Architecture

### Component Architecture

**Atomic Design Pattern**

```
Atoms (Basic Building Blocks)
  ├── Button
  ├── Input
  ├── Badge
  ├── Avatar
  └── Icon

Molecules (Simple Components)
  ├── FormField (Label + Input + Error)
  ├── SearchBar (Input + Icon + Button)
  ├── StatCard (Icon + Title + Value)
  └── UserChip (Avatar + Name + Badge)

Organisms (Complex Components)
  ├── TaskCard
  ├── TaskForm
  ├── TeamMemberList
  ├── BurndownChart
  └── Header/Sidebar

Templates (Page Layouts)
  ├── MainLayout (Header + Sidebar + Content)
  ├── AuthLayout (Centered Form)
  └── DashboardLayout (Stats + Charts + Tables)

Pages (Specific Instances)
  ├── Dashboard
  ├── TasksPage
  ├── TeamsPage
  └── AnalyticsPage
```

### State Management - Zustand

**Store Architecture**

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// stores/tasksStore.ts
interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  filters: TaskFilters;
  isLoading: boolean;
  pagination: Pagination;
  
  // Actions
  fetchTasks: (teamId: string, filters?: TaskFilters) => Promise<void>;
  createTask: (data: CreateTaskDto) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskDto) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
}

// stores/teamsStore.ts
interface TeamsState {
  teams: Team[];
  currentTeam: Team | null;
  members: TeamMember[];
  isLoading: boolean;
  
  // Actions
  fetchTeams: () => Promise<void>;
  fetchTeamDetails: (teamId: string) => Promise<void>;
  createTeam: (data: CreateTeamDto) => Promise<Team>;
  addMember: (teamId: string, userId: string, role: Role) => Promise<void>;
  updateMemberRole: (teamId: string, userId: string, role: Role) => Promise<void>;
}

// stores/notificationsStore.ts
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}
```

### Routing Strategy

```typescript
// routes/routes.tsx
const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: 'tasks',
        element: <ProtectedRoute><TasksPage /></ProtectedRoute>
      },
      {
        path: 'tasks/:id',
        element: <ProtectedRoute><TaskDetailPage /></ProtectedRoute>
      },
      {
        path: 'teams',
        element: <ProtectedRoute><TeamsPage /></ProtectedRoute>
      },
      {
        path: 'teams/:id',
        element: <ProtectedRoute><TeamDetailPage /></ProtectedRoute>
      },
      {
        path: 'analytics',
        element: (
          <RoleBasedRoute requiredRoles={['team_lead', 'admin', 'owner']}>
            <AnalyticsPage />
          </RoleBasedRoute>
        )
      },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> }
    ]
  }
];
```

### Real-Time Data Synchronization

```typescript
// hooks/useSocket.ts
const useSocket = (teamId: string) => {
  const updateTask = useTasksStore(state => state.updateTask);
  const addNotification = useNotificationsStore(state => state.addNotification);
  
  useEffect(() => {
    if (!teamId) return;
    
    // Join team room
    socket.emit('join:team', teamId);
    
    // Listen for task updates
    socket.on('task:updated', (task: Task) => {
      updateTask(task);
      addNotification({
        type: 'info',
        message: `Task "${task.title}" was updated`
      });
    });
    
    socket.on('task:created', (task: Task) => {
      // Fetch tasks again or add to local state
    });
    
    socket.on('task:deleted', (taskId: string) => {
      // Remove from local state
    });
    
    return () => {
      socket.emit('leave:team', teamId);
      socket.off('task:updated');
      socket.off('task:created');
      socket.off('task:deleted');
    };
  }, [teamId]);
};
```

---

## Real-Time Features

### WebSocket Events

#### **Connection Events**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `connection` | Client → Server | `{ token }` | Initial WebSocket connection |
| `authenticated` | Server → Client | `{ userId }` | Authentication successful |
| `disconnect` | Both | - | Connection closed |

#### **Team Events**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join:team` | Client → Server | `{ teamId }` | Join team room |
| `leave:team` | Client → Server | `{ teamId }` | Leave team room |
| `team:member_joined` | Server → Clients | `{ teamId, member }` | New member added |
| `team:member_left` | Server → Clients | `{ teamId, userId }` | Member removed |

#### **Task Events**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `task:created` | Server → Clients | `{ task }` | New task created |
| `task:updated` | Server → Clients | `{ task, changes }` | Task updated |
| `task:deleted` | Server → Clients | `{ taskId }` | Task deleted |
| `task:assigned` | Server → Clients | `{ taskId, assignedTo }` | Task assigned to user |
| `task:status_changed` | Server → Clients | `{ taskId, oldStatus, newStatus }` | Status changed |

#### **Notification Events**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `notification:new` | Server → Client | `{ notification }` | New notification |
| `notification:read` | Client → Server | `{ notificationId }` | Mark as read |

### WebSocket Implementation

#### **Backend Gateway**

```typescript
// tasks/tasks.gateway.ts
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws'
})
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  constructor(
    private authService: AuthService,
    private tasksService: TasksService
  ) {}
  
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const user = await this.authService.verifyToken(token);
      
      client.data.user = user;
      client.emit('authenticated', { userId: user.id });
    } catch (error) {
      client.disconnect();
    }
  }
  
  @SubscribeMessage('join:team')
  handleJoinTeam(client: Socket, teamId: string) {
    client.join(`team:${teamId}`);
  }
  
  @SubscribeMessage('leave:team')
  handleLeaveTeam(client: Socket, teamId: string) {
    client.leave(`team:${teamId}`);
  }
  
  // Emit to team members
  emitTaskUpdate(teamId: string, task: Task) {
    this.server.to(`team:${teamId}`).emit('task:updated', task);
  }
  
  emitTaskCreated(teamId: string, task: Task) {
    this.server.to(`team:${teamId}`).emit('task:created', task);
  }
}
```

#### **Frontend Socket Service**

```typescript
// services/socket.service.ts
class SocketService {
  private socket: Socket | null = null;
  
  connect(accessToken: string) {
    this.socket = io(WS_URL, {
      auth: { token: accessToken },
      transports: ['websocket']
    });
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    this.socket.on('authenticated', ({ userId }) => {
      console.log('Authenticated as:', userId);
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  joinTeam(teamId: string) {
    this.socket?.emit('join:team', teamId);
  }
  
  leaveTeam(teamId: string) {
    this.socket?.emit('leave:team', teamId);
  }
  
  on(event: string, callback: Function) {
    this.socket?.on(event, callback);
  }
  
  off(event: string) {
    this.socket?.off(event);
  }
}

export default new SocketService();
```

---

## Analytics System

### Analytics Metrics

#### **Team Analytics**

1. **Overview Statistics**
   - Total tasks (all time)
   - Tasks by status (todo, in_progress, completed, etc.)
   - Tasks by priority
   - Completion rate (%)
   - Overdue tasks count
   - Average completion time

2. **Completion Trends**
   - Daily task completions (last 30 days)
   - Weekly task completions (last 12 weeks)
   - Monthly task completions (last 12 months)
   - Tasks created vs completed over time

3. **Team Productivity**
   - Tasks completed per team member
   - Average completion time per member
   - Tasks in progress per member
   - Activity heat map

4. **Sprint Burndown**
   - Total story points/tasks
   - Remaining work over time
   - Ideal burndown line
   - Velocity tracking

#### **User Analytics**

- Personal task completion stats
- Personal productivity trends
- Tasks assigned vs completed
- Average time to complete tasks

### Analytics Implementation

```typescript
// analytics/analytics.service.ts
export class AnalyticsService {
  
  async getTeamOverview(teamId: string): Promise<TeamOverviewDto> {
    const tasks = await this.tasksRepository.find({ 
      where: { teamId },
      relations: ['assignedTo', 'createdBy']
    });
    
    const completed = tasks.filter(t => t.status === 'completed');
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    );
    
    return {
      totalTasks: tasks.length,
      completedTasks: completed.length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      todoTasks: tasks.filter(t => t.status === 'todo').length,
      blockedTasks: tasks.filter(t => t.status === 'blocked').length,
      completionRate: (completed.length / tasks.length) * 100,
      overdueTasksCount: overdue.length,
      averageCompletionTime: this.calculateAvgCompletionTime(completed),
      tasksByPriority: this.groupByPriority(tasks)
    };
  }
  
  async getCompletionTrends(
    teamId: string, 
    period: 'daily' | 'weekly' | 'monthly',
    limit: number = 30
  ): Promise<TrendDataPoint[]> {
    // Query activity logs grouped by date
    const trends = await this.activityLogsRepository
      .createQueryBuilder('log')
      .select('DATE(log.created_at) as date')
      .addSelect('COUNT(*) as count')
      .where('log.action_type = :action', { action: 'task_created' })
      .orWhere('log.action_type = :action', { action: 'status_changed' })
      .groupBy('DATE(log.created_at)')
      .orderBy('date', 'DESC')
      .limit(limit)
      .getRawMany();
    
    return trends;
  }
  
  async getTeamProductivity(teamId: string): Promise<UserProductivityDto[]> {
    const members = await this.teamMembersRepository.find({
      where: { teamId },
      relations: ['user']
    });
    
    const productivity = await Promise.all(
      members.map(async (member) => {
        const completedTasks = await this.tasksRepository.count({
          where: { 
            teamId,
            assignedTo: member.userId,
            status: 'completed'
          }
        });
        
        const avgCompletionTime = await this.calculateUserAvgCompletionTime(
          member.userId,
          teamId
        );
        
        return {
          userId: member.userId,
          username: member.user.username,
          tasksCompleted: completedTasks,
          avgCompletionTime
        };
      })
    );
    
    return productivity;
  }
}
```

### Chart.js Integration

```typescript
// components/analytics/BurndownChart.tsx
import { Line } from 'react-chartjs-2';

export const BurndownChart: React.FC<{ teamId: string }> = ({ teamId }) => {
  const [burndownData, setBurndownData] = useState<BurndownData | null>(null);
  
  useEffect(() => {
    analyticsService.getBurndownData(teamId).then(setBurndownData);
  }, [teamId]);
  
  const chartData = {
    labels: burndownData?.dataPoints.map(d => d.date) || [],
    datasets: [
      {
        label: 'Remaining Tasks',
        data: burndownData?.dataPoints.map(d => d.remaining) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Ideal Burndown',
        data: burndownData?.dataPoints.map(d => d.ideal) || [],
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
      }
    ]
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Sprint Burndown Chart' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
  
  return <Line data={chartData} options={options} />;
};
```

---

## Docker Strategy

### Multi-Stage Docker Builds

#### **Backend Dockerfile**

```dockerfile
# backend/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
```

#### **Frontend Dockerfile**

```dockerfile
# frontend/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose Configuration

#### **Development Environment**

```yaml
# docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: taskforge-db
    environment:
      POSTGRES_DB: taskforge
      POSTGRES_USER: taskforge_user
      POSTGRES_PASSWORD: taskforge_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - taskforge-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taskforge_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    container_name: taskforge-backend
    environment:
      NODE_ENV: development
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: taskforge
      DATABASE_USER: taskforge_user
      DATABASE_PASSWORD: taskforge_password
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 15m
      REFRESH_TOKEN_EXPIRES_IN: 7d
    ports:
      - "3000:3000"
    volumes:
      - ./backend/src:/app/src
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - taskforge-network
    command: npm run start:dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: taskforge-frontend
    environment:
      VITE_API_URL: http://localhost:3000
      VITE_WS_URL: ws://localhost:3000
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - taskforge-network
    command: npm run dev -- --host

networks:
  taskforge-network:
    driver: bridge

volumes:
  postgres_data:
```

#### **Production Environment**

```yaml
# docker-compose.prod.yml

version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: taskforge-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - static_files:/usr/share/nginx/html
    depends_on:
      - backend
      - frontend
    networks:
      - taskforge-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: taskforge-backend
    environment:
      NODE_ENV: production
      DATABASE_HOST: ${DB_HOST}
      DATABASE_PORT: ${DB_PORT}
      DATABASE_NAME: ${DB_NAME}
      DATABASE_USER: ${DB_USER}
      DATABASE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 15m
      REFRESH_TOKEN_EXPIRES_IN: 7d
    networks:
      - taskforge-network
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 512M

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
      args:
        VITE_API_URL: ${API_URL}
    container_name: taskforge-frontend
    volumes:
      - static_files:/usr/share/nginx/html
    networks:
      - taskforge-network
    restart: unless-stopped

networks:
  taskforge-network:
    driver: bridge

volumes:
  static_files:
```

### Nginx Configuration

```nginx
# nginx.conf

upstream backend {
    server backend:3000;
}

server {
    listen 80;
    server_name taskforge.com www.taskforge.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name taskforge.com www.taskforge.com;
    
    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket proxy
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### **Backend CI/CD**

```yaml
# .github/workflows/backend-ci.yml

name: Backend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'backend/**'

jobs:
  test:
    name: Test Backend
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: taskforge_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        working-directory: backend
        run: npm ci
      
      - name: Run linter
        working-directory: backend
        run: npm run lint
      
      - name: Run unit tests
        working-directory: backend
        run: npm run test:cov
        env:
          DATABASE_HOST: localhost
          DATABASE_PORT: 5432
          DATABASE_NAME: taskforge_test
          DATABASE_USER: test_user
          DATABASE_PASSWORD: test_password
          JWT_SECRET: test-secret-key
      
      - name: Run e2e tests
        working-directory: backend
        run: npm run test:e2e
        env:
          DATABASE_HOST: localhost
          DATABASE_PORT: 5432
          DATABASE_NAME: taskforge_test
          DATABASE_USER: test_user
          DATABASE_PASSWORD: test_password
          JWT_SECRET: test-secret-key
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend

  build:
    name: Build Backend Docker Image
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build, tag, and push image to ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: taskforge-backend
          IMAGE_TAG: ${{ github.sha }}
        working-directory: backend
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  deploy:
    name: Deploy to AWS ECS
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster taskforge-cluster \
            --service taskforge-backend-service \
            --force-new-deployment
      
      - name: Wait for deployment to complete
        run: |
          aws ecs wait services-stable \
            --cluster taskforge-cluster \
            --services taskforge-backend-service
```

#### **Frontend CI/CD**

```yaml
# .github/workflows/frontend-ci.yml

name: Frontend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci.yml'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'frontend/**'

jobs:
  test:
    name: Test Frontend
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: frontend
        run: npm ci
      
      - name: Run linter
        working-directory: frontend
        run: npm run lint
      
      - name: Run type check
        working-directory: frontend
        run: npm run type-check
      
      - name: Run unit tests
        working-directory: frontend
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend

  build:
    name: Build and Deploy Frontend
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: frontend
        run: npm ci
      
      - name: Build application
        working-directory: frontend
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_WS_URL: ${{ secrets.VITE_WS_URL }}
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        working-directory: frontend/dist
        run: |
          aws s3 sync . s3://${{ secrets.S3_BUCKET }} --delete
      
      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### Deployment Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    [ git push to main ]
                              │
        ┌─────────────────────┴──────────────────────┐
        │                                             │
        ▼                                             ▼
┌──────────────────┐                        ┌──────────────────┐
│  Backend CI/CD   │                        │  Frontend CI/CD  │
├──────────────────┤                        ├──────────────────┤
│ 1. Lint          │                        │ 1. Lint          │
│ 2. Test          │                        │ 2. Type Check    │
│ 3. Build Docker  │                        │ 3. Test          │
│ 4. Push to ECR   │                        │ 4. Build         │
│ 5. Deploy to ECS │                        │ 5. Deploy to S3  │
└──────────────────┘                        └──────────────────┘
        │                                             │
        └─────────────────────┬──────────────────────┘
                              ▼
                  [ Application Deployed ]
```

---

## Technology Decisions

### Why NestJS over Express?

| Criteria | NestJS | Express |
|----------|--------|---------|
| **Architecture** | ✅ Built-in modular architecture | ❌ Requires manual setup |
| **TypeScript** | ✅ First-class support | ⚠️ Requires configuration |
| **Dependency Injection** | ✅ Built-in DI container | ❌ Manual implementation |
| **Testing** | ✅ Testing utilities included | ⚠️ Requires setup |
| **WebSockets** | ✅ Native Socket.io integration | ⚠️ Manual integration |
| **API Documentation** | ✅ Swagger integration | ⚠️ Requires plugins |
| **Scalability** | ✅ Enterprise-ready patterns | ⚠️ Depends on implementation |
| **Learning Curve** | ⚠️ Steeper (Angular-like) | ✅ Minimal |

**Decision**: NestJS provides better structure for a portfolio project demonstrating enterprise development skills.

### Why Zustand for State Management?

| Criteria | Zustand | Redux Toolkit | Context API |
|----------|---------|---------------|-------------|
| **Boilerplate** | ✅ Minimal | ⚠️ Moderate | ✅ Minimal |
| **Performance** | ✅ Excellent | ✅ Excellent | ⚠️ Can cause re-renders |
| **DevTools** | ✅ Redux DevTools support | ✅ Native DevTools | ❌ No DevTools |
| **Learning Curve** | ✅ Easy | ⚠️ Moderate | ✅ Easy |
| **Bundle Size** | ✅ ~1KB | ⚠️ ~9KB | ✅ 0KB (built-in) |
| **TypeScript** | ✅ Excellent | ✅ Excellent | ⚠️ Good |

**Decision**: Zustand offers the best balance of simplicity, performance, and developer experience for this project.

### Why TypeORM?

| Criteria | TypeORM | Prisma | Sequelize |
|----------|---------|--------|-----------|
| **TypeScript Support** | ✅ Native | ✅ Excellent | ⚠️ Good |
| **NestJS Integration** | ✅ Official support | ✅ Good | ✅ Official support |
| **Migrations** | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| **Query Builder** | ✅ Powerful | ⚠️ Limited | ✅ Good |
| **Performance** | ✅ Good | ✅ Excellent | ✅ Good |
| **Learning Curve** | ⚠️ Moderate | ✅ Easy | ⚠️ Moderate |

**Decision**: TypeORM is the standard ORM in the NestJS ecosystem with excellent TypeScript support.

### Why Material-UI (MUI)?

| Criteria | MUI | Ant Design | Chakra UI |
|----------|-----|------------|-----------|
| **Component Library** | ✅ Comprehensive | ✅ Comprehensive | ✅ Good |
| **Customization** | ✅ Excellent (theming) | ✅ Good | ✅ Excellent |
| **Documentation** | ✅ Excellent | ✅ Excellent | ✅ Good |
| **Enterprise Ready** | ✅ Yes | ✅ Yes | ⚠️ Growing |
| **Bundle Size** | ⚠️ ~300KB | ⚠️ ~400KB | ✅ ~150KB |
| **TypeScript** | ✅ Excellent | ✅ Excellent | ✅ Excellent |

**Decision**: MUI is the most widely adopted React UI library with excellent Material Design implementation.

### Additional Technology Choices

- **Vite over Create React App**: Faster builds, better DX, native ESM
- **Jest/Vitest for Testing**: Industry standard with excellent TypeScript support
- **Socket.io for WebSockets**: Reliable, feature-rich, auto-reconnection
- **Chart.js**: Lightweight, flexible, well-documented
- **PostgreSQL over MongoDB**: Better for relational data, ACID compliance, mature ecosystem
- **Docker**: Standard for containerization, portable, consistent environments
- **AWS over Heroku/Vercel**: More control, scalable, industry standard for portfolio

---

## Security Considerations

### Application Security

1. **Authentication Security**
   - ✅ Bcrypt password hashing (10 rounds)
   - ✅ JWT with short expiration (15 minutes)
   - ✅ Refresh tokens in httpOnly cookies
   - ✅ Token rotation on refresh
   - ✅ Secure password requirements (8+ chars, mixed case, numbers)

2. **Authorization Security**
   - ✅ Role-based access control (RBAC)
   - ✅ Permission-based guards
   - ✅ Resource ownership validation
   - ✅ Team membership verification

3. **API Security**
   - ✅ Rate limiting (express-rate-limit)
   - ✅ Helmet.js for security headers
   - ✅ CORS configuration
   - ✅ Request validation (class-validator)
   - ✅ SQL injection prevention (TypeORM parameterized queries)
   - ✅ XSS protection (input sanitization)

4. **Data Security**
   - ✅ Environment variables for secrets
   - ✅ Database connection pooling
   - ✅ Encrypted database connections (SSL)
   - ✅ No sensitive data in logs
   - ✅ Secure cookie settings (httpOnly, secure, sameSite)

5. **Infrastructure Security**
   - ✅ HTTPS/TLS encryption
   - ✅ Security groups (AWS)
   - ✅ Private subnets for database
   - ✅ Secrets management (AWS Secrets Manager)
   - ✅ Regular security updates (Dependabot)

### Security Headers (Helmet.js)

```typescript
// main.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.API_URL],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' }
}));
```

### Rate Limiting Strategy

```typescript
// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Stricter limit for auth endpoints
  skipSuccessfulRequests: true
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
```

---

## Deployment Architecture

### AWS Infrastructure

```
┌──────────────────────────────────────────────────────────────┐
│                         AWS Cloud                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    Route 53 (DNS)                       │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │                                       │
│  ┌────────────────────▼───────────────────────────────────┐  │
│  │          CloudFront (CDN) [Optional]                    │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │                                       │
│  ┌────────────────────▼───────────────────────────────────┐  │
│  │    Application Load Balancer (ALB)                      │  │
│  │    - SSL/TLS Termination                                │  │
│  │    - Health Checks                                      │  │
│  └────┬────────────────────────────────┬──────────────────┘  │
│       │                                │                      │
│  ┌────▼─────────────┐            ┌────▼─────────────┐        │
│  │   Target Group   │            │   Target Group   │        │
│  │    (Backend)     │            │   (Frontend)     │        │
│  └────┬─────────────┘            └────┬─────────────┘        │
│       │                                │                      │
│  ┌────▼──────────────────────────┐    │                      │
│  │  ECS Cluster                  │    │                      │
│  │  ┌─────────────────────────┐  │    │                      │
│  │  │  ECS Service (Backend)  │  │    │                      │
│  │  │  - Task Definition      │  │    │                      │
│  │  │  - Auto Scaling         │  │    │                      │
│  │  │  - Multiple Tasks       │  │    │                      │
│  │  └─────────────────────────┘  │    │                      │
│  └───────────────────────────────┘    │                      │
│                │                       │                      │
│  ┌─────────────▼──────────────┐  ┌────▼─────────────┐        │
│  │  ECR (Container Registry)  │  │  S3 Bucket       │        │
│  │  - Backend Images          │  │  - Static Files  │        │
│  └────────────────────────────┘  └──────────────────┘        │
│                │                                              │
│  ┌─────────────▼──────────────────────────────┐              │
│  │  RDS PostgreSQL (Multi-AZ)                 │              │
│  │  - Primary Instance                        │              │
│  │  - Standby Instance (Failover)             │              │
│  │  - Automated Backups                       │              │
│  └────────────────────────────────────────────┘              │
│                                                               │
│  ┌───────────────────────────────────────────┐               │
│  │  CloudWatch                               │               │
│  │  - Logs Aggregation                       │               │
│  │  - Metrics & Monitoring                   │               │
│  │  - Alarms                                 │               │
│  └───────────────────────────────────────────┘               │
│                                                               │
│  ┌───────────────────────────────────────────┐               │
│  │  Secrets Manager                          │               │
│  │  - Database Credentials                   │               │
│  │  - JWT Secrets                            │               │
│  │  - API Keys                               │               │
│  └───────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

### AWS Services Breakdown

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Route 53** | DNS management | Domain routing to ALB |
| **CloudFront** | CDN (optional) | Cache static assets, reduce latency |
| **Application Load Balancer** | Load balancing | HTTPS termination, health checks |
| **ECS (Fargate)** | Container orchestration | Run backend containers, auto-scaling |
| **ECR** | Container registry | Store Docker images |
| **S3** | Object storage | Frontend static files |
| **RDS PostgreSQL** | Database | Multi-AZ deployment, automated backups |
| **CloudWatch** | Monitoring | Logs, metrics, alarms |
| **Secrets Manager** | Secrets management | Database credentials, API keys |
| **VPC** | Network isolation | Public/private subnets, security groups |

### ECS Task Definition Example

```json
{
  "family": "taskforge-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/taskforge-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "3000" }
      ],
      "secrets": [
        {
          "name": "DATABASE_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:taskforge/db-host"
        },
        {
          "name": "DATABASE_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:taskforge/db-password"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:taskforge/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/taskforge-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### Environment Configuration

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database (from Secrets Manager)
DATABASE_HOST=taskforge-db.xxxxx.us-east-1.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=taskforge
DATABASE_USER=taskforge_admin
DATABASE_PASSWORD=<from-secrets-manager>

# JWT (from Secrets Manager)
JWT_SECRET=<from-secrets-manager>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://taskforge.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Scalability & Performance

### Backend Scalability

1. **Horizontal Scaling**
   - ECS auto-scaling based on CPU/memory
   - Multiple task instances behind ALB
   - Stateless application design

2. **Database Scaling**
   - Read replicas for read-heavy operations
   - Connection pooling (TypeORM)
   - Indexes on frequently queried columns
   - Pagination for large datasets

3. **Caching Strategy**
   - In-memory caching for frequently accessed data
   - Redis for distributed caching (future)
   - CDN for static assets

4. **Performance Optimizations**
   - Lazy loading of relationships
   - Bulk operations for batch updates
   - Query optimization with TypeORM query builder
   - Compression middleware (gzip)

### Frontend Scalability

1. **Code Splitting**
   - Route-based code splitting
   - Lazy loading of components
   - Dynamic imports

2. **Asset Optimization**
   - Image optimization (WebP, lazy loading)
   - Tree shaking (Vite)
   - Minification and compression
   - CDN delivery

3. **Performance Best Practices**
   - React.memo for expensive components
   - useMemo/useCallback for optimizations
   - Virtual scrolling for long lists
   - Debouncing for search/filters

### Database Optimization

```typescript
// Example: Optimized task query with joins and pagination
async findAllWithPagination(
  teamId: string,
  filters: TaskFilters,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<Task>> {
  const query = this.taskRepository
    .createQueryBuilder('task')
    .leftJoinAndSelect('task.assignedTo', 'assignedUser')
    .leftJoinAndSelect('task.createdBy', 'createdUser')
    .where('task.teamId = :teamId', { teamId })
    .orderBy('task.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);
  
  // Apply filters
  if (filters.status) {
    query.andWhere('task.status = :status', { status: filters.status });
  }
  
  if (filters.priority) {
    query.andWhere('task.priority = :priority', { priority: filters.priority });
  }
  
  if (filters.assignedTo) {
    query.andWhere('task.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
  }
  
  const [tasks, total] = await query.getManyAndCount();
  
  return {
    data: tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

---

## Development Workflow

### Local Development Setup

1. **Clone Repository**

   ```bash
   git clone https://github.com/yourusername/TaskForge.git
   cd TaskForge
   ```

2. **Environment Setup**

   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit .env files with your local configuration
   ```

3. **Start with Docker Compose**

   ```bash
   docker-compose up -d
   ```

4. **Access Application**
   - Frontend: <http://localhost:5173>
   - Backend API: <http://localhost:3000>
   - API Docs: <http://localhost:3000/api-docs>

### Git Workflow

```
main (production)
  │
  ├─── develop (staging)
  │      │
  │      ├─── feature/user-authentication
  │      ├─── feature/task-management
  │      ├─── bugfix/login-validation
  │      └─── hotfix/security-patch
  │
  └─── release/v1.0.0
```

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: New features
- **bugfix/***: Bug fixes
- **hotfix/***: Urgent production fixes
- **release/***: Release preparation

### Commit Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example**:

```
feat(tasks): add real-time task updates via WebSocket

- Implemented Socket.io gateway for task events
- Added event listeners in frontend
- Updated task store to handle real-time updates

Closes #123
```

### Code Review Process

1. Create feature branch
2. Implement changes
3. Write tests
4. Create pull request
5. Code review (at least 1 approval)
6. CI/CD checks pass
7. Merge to develop
8. Deploy to staging
9. QA testing
10. Merge to main
11. Deploy to production

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

- [ ] Project structure setup
- [ ] Backend boilerplate (NestJS)
- [ ] Frontend boilerplate (React + Vite)
- [ ] Database schema creation
- [ ] Docker setup
- [ ] CI/CD pipeline basic setup

### Phase 2: Authentication (Week 3)

- [ ] User registration/login
- [ ] JWT authentication
- [ ] Password hashing
- [ ] Auth guards and middleware
- [ ] Frontend auth flow
- [ ] Token refresh mechanism

### Phase 3: Core Features (Week 4-6)

- [ ] Team management (CRUD)
- [ ] Team member management
- [ ] Task management (CRUD)
- [ ] Role-based access control
- [ ] Task assignment
- [ ] Status/priority management

### Phase 4: Real-Time Features (Week 7)

- [ ] WebSocket setup
- [ ] Real-time task updates
- [ ] Notifications system
- [ ] Live team activity feed

### Phase 5: Analytics (Week 8)

- [ ] Activity logging
- [ ] Team statistics
- [ ] Completion trends
- [ ] Productivity metrics
- [ ] Burndown charts
- [ ] Chart.js integration

### Phase 6: Polish & Testing (Week 9-10)

- [ ] Unit tests (backend)
- [ ] Unit tests (frontend)
- [ ] E2E tests
- [ ] Performance optimization
- [ ] UI/UX refinements
- [ ] Error handling improvements

### Phase 7: Deployment (Week 11)

- [ ] AWS infrastructure setup
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation finalization
- [ ] Demo video creation

---

## Appendix

### Environment Variables Reference

#### Backend

```env
NODE_ENV=development|production
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=taskforge
DATABASE_USER=taskforge_user
DATABASE_PASSWORD=your_password
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=TaskForge
```

### API Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_001` | 401 | Invalid credentials |
| `AUTH_002` | 401 | Token expired |
| `AUTH_003` | 403 | Insufficient permissions |
| `USER_001` | 404 | User not found |
| `USER_002` | 409 | Email already exists |
| `TEAM_001` | 404 | Team not found |
| `TEAM_002` | 403 | Not a team member |
| `TASK_001` | 404 | Task not found |
| `TASK_002` | 403 | Cannot modify task |
| `VAL_001` | 400 | Validation error |
| `SRV_001` | 500 | Internal server error |

### Useful Commands

```bash
# Development
npm run dev                    # Start both frontend and backend
docker-compose up -d           # Start with Docker
docker-compose logs -f         # View logs

# Backend
cd backend
npm run start:dev              # Start in watch mode
npm run test                   # Run tests
npm run test:e2e              # Run E2E tests
npm run migration:generate     # Generate migration
npm run migration:run          # Run migrations

# Frontend
cd frontend
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview               # Preview production build
npm run test                   # Run tests
npm run lint                   # Lint code

# Docker
docker build -t taskforge-backend ./backend
docker build -t taskforge-frontend ./frontend
docker-compose -f docker-compose.prod.yml up -d

# AWS
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/taskforge-backend:latest
aws ecs update-service --cluster taskforge-cluster --service taskforge-backend-service --force-new-deployment
```

---

## Conclusion

This architecture document provides a comprehensive blueprint for building TaskForge, a modern full-stack project management application. The design emphasizes:

- **Scalability**: Horizontal scaling with containerization and cloud infrastructure
- **Maintainability**: Modular architecture with clear separation of concerns
- **Security**: Industry-standard authentication, authorization, and data protection
- **Performance**: Optimized queries, caching strategies, and real-time capabilities
- **Developer Experience**: Well-structured codebase, automated testing, and CI/CD

The architecture is production-ready and demonstrates enterprise-level development practices suitable for a portfolio project.

### Next Steps

1. Review and approve this architecture document
2. Set up the project structure
3. Begin implementation following the phased approach
4. Maintain documentation as the project evolves

---

**Document Version**: 1.0.0  
**Author**: Omar Aglan
**Date**: November 2025  
**Status**: Ready for Implementation
