# TaskForge Backend

Full Stack Project Management Application - NestJS Backend API

## 🚀 Features

- **NestJS Framework**: Modular, scalable architecture with TypeScript
- **PostgreSQL Database**: TypeORM integration with full entity relationships
- **JWT Authentication**: Secure authentication with access and refresh tokens
- **Activity Logging & Audit System**: Comprehensive activity tracking for security and analytics
- **WebSocket Support**: Real-time updates via Socket.io (ready for Phase 8)
- **Rate Limiting**: Protection against brute force attacks
- **Security**: Helmet.js, CORS, input validation
- **Configuration**: Environment-based configuration with validation
- **Health Checks**: Database connection and system health endpoints

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher) - [Download](https://nodejs.org/)
- **npm** (v10.x or higher) - Comes with Node.js
- **PostgreSQL** (v15.x or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TaskForge/backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:

- NestJS core and platform
- TypeORM and PostgreSQL driver
- Authentication libraries (Passport, JWT, bcrypt)
- WebSocket libraries (Socket.io)
- Validation libraries
- Security libraries (Helmet, Throttler)

### 3. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:

```sql
CREATE DATABASE taskforge_dev;
```

3. (Optional) Create a dedicated user:

```sql
CREATE USER taskforge_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE taskforge_dev TO taskforge_user;
```

#### Option B: Using Docker

```bash
docker run --name taskforge-postgres \
  -e POSTGRES_DB=taskforge_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 4. Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=taskforge_dev

# JWT (Change these in production!)
JWT_SECRET=your-secret-key-change-in-production-min-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production-min-32-characters
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: Change the JWT secrets in production to secure random strings.

## 🏃‍♂️ Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run start:dev
```

The server will start on `http://localhost:3000`

### Production Mode

Build and run in production mode:

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Debug Mode

Start with debugging enabled:

```bash
npm run start:debug
```

## 📡 API Endpoints

### Health Check

Check if the server and database are running:

```bash
GET http://localhost:3000/api/v1/health
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 123.45,
    "timestamp": "2025-11-04T04:00:00.000Z",
    "database": {
      "status": "connected",
      "type": "postgres"
    },
    "memory": {
      "used": 45,
      "total": 128,
      "unit": "MB"
    }
  }
}
```

### Application Info

Get application information:

```bash
GET http://localhost:3000/api/v1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "name": "TaskForge API",
    "version": "1.0.0",
    "description": "Full Stack Project Management Application Backend",
    "environment": "development",
    "apiPrefix": "api/v1",
    "documentation": "/api/v1/docs"
  },
  "timestamp": "2025-11-04T04:00:00.000Z"
}
```

---

## 🔐 Authentication Endpoints

### Register a New User

Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`
**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- First Name: Minimum 2 characters
- Last Name: Minimum 2 characters

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "member",
      "avatarUrl": null,
      "createdAt": "2025-11-04T06:00:00.000Z",
      "updatedAt": "2025-11-04T06:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-11-04T06:00:00.000Z"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taskforge.com",
    "password": "Admin@123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

---

### Login

Authenticate a user and receive tokens.

**Endpoint:** `POST /api/v1/auth/login`
**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "member",
      "avatarUrl": null,
      "createdAt": "2025-11-04T06:00:00.000Z",
      "updatedAt": "2025-11-04T06:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-11-04T06:00:00.000Z"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taskforge.com",
    "password": "Admin@123"
  }'
```

---

### Refresh Token

Get a new access token using a refresh token.

**Endpoint:** `POST /api/v1/auth/refresh`
**Access:** Public

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-11-04T06:00:00.000Z"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }'
```

---

### Logout

Logout the current user (invalidate tokens on client-side).

**Endpoint:** `POST /api/v1/auth/logout`
**Access:** Protected (requires JWT)

**Headers:**

```
Authorization: Bearer <access-token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Logout successful"
  },
  "timestamp": "2025-11-04T06:00:00.000Z"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer your-access-token-here"
```

---

### Get Current User Profile

Get the profile of the currently authenticated user.

**Endpoint:** `GET /api/v1/auth/profile`
**Access:** Protected (requires JWT)

**Headers:**

```
Authorization: Bearer <access-token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "member",
    "avatarUrl": null,
    "createdAt": "2025-11-04T06:00:00.000Z",
    "updatedAt": "2025-11-04T06:00:00.000Z"
  },
  "timestamp": "2025-11-04T06:00:00.000Z"
}
```

**Example:**

```bash
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer your-access-token-here"
```

---

## 👤 User Management Endpoints

### Get My Profile

Get your own user profile.

**Endpoint:** `GET /api/v1/users/me`
**Access:** Protected (requires JWT)

**Headers:**

```
Authorization: Bearer <access-token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "member",
    "avatarUrl": null,
    "createdAt": "2025-11-04T06:00:00.000Z",
    "updatedAt": "2025-11-04T06:00:00.000Z"
  },
  "timestamp": "2025-11-04T06:00:00.000Z"
}
```

---

### Update My Profile

Update your own profile information.

**Endpoint:** `PATCH /api/v1/users/me`
**Access:** Protected (requires JWT)

**Headers:**

```
Authorization: Bearer <access-token>
```

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "member",
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdAt": "2025-11-04T06:00:00.000Z",
    "updatedAt": "2025-11-04T06:30:00.000Z"
  },
  "timestamp": "2025-11-04T06:30:00.000Z"
}
```

**Example:**

```bash
curl -X PATCH http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer your-access-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

---

### Change Password

Change your account password.

**Endpoint:** `PATCH /api/v1/users/me/password`
**Access:** Protected (requires JWT)

**Headers:**

```
Authorization: Bearer <access-token>
```

**Request Body:**

```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@456"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  },
  "timestamp": "2025-11-04T06:00:00.000Z"
}
```

**Example:**

```bash
curl -X PATCH http://localhost:3000/api/v1/users/me/password \
  -H "Authorization: Bearer your-access-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Admin@123",
    "newPassword": "NewAdmin@456"
  }'
```

---

## 🔑 Authentication System

### Token Management

The authentication system uses JWT (JSON Web Tokens) with two types of tokens:

1. **Access Token**
   - Short-lived (15 minutes)
   - Used for API requests
   - Include in `Authorization: Bearer <token>` header
   
2. **Refresh Token**
   - Long-lived (7 days)
   - Used to obtain new access tokens
   - Should be stored securely

### Token Flow

```
1. User logs in → Receives access token + refresh token
2. Client stores tokens securely
3. Client includes access token in API requests
4. When access token expires → Use refresh token to get new tokens
5. When refresh token expires → User must login again
```

### User Roles

The system supports role-based access control with the following roles:

- **OWNER**: Full system access, can delete teams
- **ADMIN**: Manage team settings and members
- **TEAM_LEAD**: Can add members and assign tasks
- **MEMBER**: Basic task management

### Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT token authentication
- ✅ Token expiration and refresh mechanism
- ✅ Role-based access control (RBAC)
- ✅ Input validation with class-validator
- ✅ Rate limiting for API endpoints
- ✅ Secure HTTP headers with Helmet
- ✅ CORS protection

### Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "statusCode": 401,
    "message": "Invalid credentials",
    "error": "Unauthorized",
    "timestamp": "2025-11-04T06:00:00.000Z",
    "path": "/api/v1/auth/login"
  }
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## 🧪 Testing

### Run Unit Tests

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:cov
```

### Run E2E Tests

```bash
npm run test:e2e
```

## 🔧 Development Tools

### Linting

Check code quality:

```bash
npm run lint
```

### Formatting

Format code with Prettier:

```bash
npm run format
```

### TypeScript Compilation

Check TypeScript compilation:

```bash
npx tsc --noEmit
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── common/              # Shared utilities
│   │   ├── decorators/      # Custom decorators (@CurrentUser, @Public, @Roles)
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Auth guards (JWT, Roles)
│   │   ├── interceptors/    # Response interceptors
│   │   └── pipes/           # Validation pipes
│   ├── config/              # Configuration modules
│   │   ├── app.config.ts    # App configuration
│   │   ├── database.config.ts # Database configuration
│   │   ├── jwt.config.ts    # JWT configuration
│   │   └── index.ts         # Config exports
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication module
│   │   │   ├── dto/         # Login, Register, RefreshToken DTOs
│   │   │   ├── strategies/  # JWT & Refresh strategies
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/           # User management module
│   │   │   ├── dto/         # UpdateUser, ChangePassword DTOs
│   │   │   ├── entities/    # User entity
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── teams/           # Teams management module
│   │   │   ├── dto/         # CreateTeam, UpdateTeam, AddMember, UpdateMemberRole DTOs
│   │   │   ├── entities/    # Team, TeamMember entities
│   │   │   ├── helpers/     # Team permissions helper
│   │   │   ├── teams.controller.ts
│   │   │   ├── teams.service.ts
│   │   │   └── teams.module.ts
│   │   ├── tasks/           # Tasks management module
│   │   │   ├── dto/         # CreateTask, UpdateTask, FilterTasks DTOs
│   │   │   ├── entities/    # Task entity
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   └── tasks.module.ts
│   │   └── activity/        # Activity logging module
│   │       ├── dto/         # CreateActivityLog, FilterActivityLogs DTOs
│   │       ├── entities/    # ActivityLog entity
│   │       ├── enums/       # ActivityAction, EntityType enums
│   │       ├── helpers/     # Metadata builders, analytics helpers
│   │       ├── interfaces/  # Activity interfaces
│   │       ├── activity.controller.ts
│   │       ├── activity.service.ts
│   │       └── activity.module.ts
│   ├── app.module.ts        # Root module
│   ├── app.controller.ts    # Root controller
│   ├── app.service.ts       # Root service
│   └── main.ts              # Application entry point
├── test/                    # E2E tests
├── .env                     # Environment variables (ignored by git)
├── .env.example             # Environment template
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── .gitignore               # Git ignore rules
├── nest-cli.json            # NestJS CLI configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## 🔐 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3000` | No |
| `API_PREFIX` | API route prefix | `api/v1` | No |
| `DB_HOST` | Database host | `localhost` | Yes |
| `DB_PORT` | Database port | `5432` | Yes |
| `DB_USERNAME` | Database username | `postgres` | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_NAME` | Database name | `taskforge_dev` | Yes |
| `JWT_SECRET` | JWT secret key | - | Yes (Phase 3) |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` | No |
| `JWT_REFRESH_SECRET` | Refresh token secret | - | Yes (Phase 3) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` | No |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |

## 🚨 Troubleshooting

### Database Connection Issues

**Error**: `Connection terminated unexpectedly`

**Solution**:

- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE taskforge_dev;`

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:

- Change the `PORT` in `.env` file
- Or kill the process using port 3000

### Module Not Found Errors

**Error**: `Cannot find module '@nestjs/...'`

**Solution**:

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📝 Implementation Phases Status

- ✅ **Phase 1**: Foundation setup (COMPLETED)
- ✅ **Phase 2**: Backend foundation (COMPLETED)
- ✅ **Phase 3**: Authentication & Authorization (COMPLETED)
- ✅ **Phase 4**: Core API - Teams & Tasks CRUD (COMPLETED)
- ✅ **Phase 5**: Activity Logging & Audit System (COMPLETED)
- 🔜 **Phase 6-7**: Frontend Implementation
- 🔜 **Phase 8**: Real-time Features (WebSocket)
- 🔜 **Phase 9**: Analytics Dashboard
- 🔜 **Phase 10**: Testing & Deployment

### Phase 3 Completed Features

- ✅ User Entity with password hashing (bcrypt, 12 rounds)
- ✅ JWT Authentication (access & refresh tokens)
- ✅ User registration and login
- ✅ Password change functionality
- ✅ Profile management endpoints
- ✅ Role-based access control (RBAC)
- ✅ JWT Guards and Strategies (access & refresh)
- ✅ Custom Decorators (@CurrentUser, @Roles, @Public)
- ✅ Global Exception Filters
- ✅ Response Transformation Interceptors
- ✅ Comprehensive API documentation

### Phase 4 Completed Features

- ✅ Team Entity with owner relationship
- ✅ TeamMember Entity with composite unique constraint
- ✅ Task Entity with full relationships
- ✅ Team CRUD operations with permission system
- ✅ Team member management (add, remove, update roles)
- ✅ Task CRUD operations with advanced filtering
- ✅ Task assignment and status management
- ✅ Team-specific task endpoints
- ✅ Task statistics and analytics foundation
- ✅ Permission helpers for team operations
- ✅ Comprehensive filtering and pagination
- ✅ Search functionality for tasks
- ✅ Updated User entity with all relations
- ✅ Complete API documentation (see [API-TEAMS-TASKS.md](./API-TEAMS-TASKS.md))

### Phase 5 Completed Features

- ✅ ActivityLog Entity for immutable audit trail
- ✅ Activity action enums (26+ action types)
- ✅ Entity type enums for categorization
- ✅ Comprehensive ActivityService with filtering & pagination
- ✅ Activity controller with role-based access
- ✅ @LogActivity decorator for automatic logging
- ✅ Activity logging interceptor for auto-capture
- ✅ Metadata builders for structured activity data
- ✅ Activity analytics helpers (trends, anomaly detection)
- ✅ Integration with Auth module (login, logout, register, password change)
- ✅ Integration with Users module (profile updates)
- ✅ Integration with Teams module (all team operations)
- ✅ Integration with Tasks module (all task operations)
- ✅ IP address and User-Agent tracking
- ✅ Sensitive data sanitization
- ✅ Activity statistics and reporting
- ✅ Complete API documentation (see [ACTIVITY-LOGGING.md](./ACTIVITY-LOGGING.md))

## 🔍 Activity Logging System

TaskForge includes a comprehensive activity logging and audit system that tracks all important user actions for security, compliance, and analytics purposes.

### Logged Activities

The system automatically logs:

- **Authentication**: Login, logout, registration, password changes
- **Team Operations**: Create, update, delete teams, member management
- **Task Operations**: Create, update, delete, assign, status changes
- **User Operations**: Profile updates, role changes

### Activity Endpoints

All activity endpoints are protected and role-based:

- `GET /api/v1/activity` - Get all activities (Admin only)
- `GET /api/v1/activity/me` - Get your activities
- `GET /api/v1/activity/entity/:entityType/:entityId` - Get entity activities
- `GET /api/v1/activity/team/:teamId` - Get team activities
- `GET /api/v1/activity/recent` - Get recent activities
- `GET /api/v1/activity/stats` - Get activity statistics

### Key Features

- **Immutable Logs**: Activity logs cannot be modified or deleted (except admin cleanup)
- **Automatic Logging**: Uses `@LogActivity` decorator for seamless integration
- **Metadata**: Rich metadata including IP addresses, user agents, and action details
- **Privacy**: Automatic sanitization of sensitive data (passwords, tokens)
- **Analytics**: Built-in analytics for activity trends and anomaly detection
- **Filtering**: Advanced filtering by user, action, entity, date range
- **Pagination**: Efficient pagination for large datasets

### Example Usage

```typescript
// Automatically logged when decorator is applied
@LogActivity(ActivityAction.TEAM_CREATE, EntityType.TEAM)
@Post()
async createTeam(@Body() dto: CreateTeamDto) {
  // Activity is automatically logged after successful execution
}
```

For complete documentation, see [ACTIVITY-LOGGING.md](./ACTIVITY-LOGGING.md)

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Architecture Document](../ARCHITECTURE.md)
- [Activity Logging Documentation](./ACTIVITY-LOGGING.md)

## 🤝 Contributing

This is a portfolio project. For any suggestions or issues, please refer to the main repository.

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using NestJS and TypeScript**
