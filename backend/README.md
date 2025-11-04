# TaskForge Backend

Full Stack Project Management Application - NestJS Backend API

## 🚀 Features

- **NestJS Framework**: Modular, scalable architecture with TypeScript
- **PostgreSQL Database**: TypeORM integration with full entity relationships
- **JWT Authentication**: Secure authentication with access and refresh tokens (ready for Phase 3)
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
│   │   ├── decorators/      # Custom decorators
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Auth guards
│   │   ├── interceptors/    # Response interceptors
│   │   └── pipes/           # Validation pipes
│   ├── config/              # Configuration modules
│   │   ├── app.config.ts    # App configuration
│   │   ├── database.config.ts # Database configuration
│   │   ├── jwt.config.ts    # JWT configuration
│   │   └── index.ts         # Config exports
│   ├── modules/             # Feature modules (Phase 3+)
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

## 📝 Next Steps (Implementation Phases)

- ✅ **Phase 1**: Foundation setup (COMPLETED)
- ⏳ **Phase 2**: Backend foundation (CURRENT)
- 🔜 **Phase 3**: Authentication & Authorization
- 🔜 **Phase 4**: Teams Module
- 🔜 **Phase 5**: Tasks Module
- 🔜 **Phase 6**: Real-time Features (WebSocket)
- 🔜 **Phase 7**: Analytics Module
- 🔜 **Phase 8**: Testing & Deployment

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Architecture Document](../ARCHITECTURE.md)

## 🤝 Contributing

This is a portfolio project. For any suggestions or issues, please refer to the main repository.

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using NestJS and TypeScript**
