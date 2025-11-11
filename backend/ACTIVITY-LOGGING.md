# Activity Logging & Audit System

Comprehensive activity tracking and audit system for TaskForge backend API.

## Overview

The Activity Logging system provides a complete audit trail of all important user actions within TaskForge. It tracks authentication events, team operations, task management, and user profile changes for security, compliance, and analytics purposes.

### Key Features

- ✅ **Immutable Audit Trail**: Logs cannot be modified or deleted (except by admin cleanup)
- ✅ **Automatic Logging**: Seamless integration using `@LogActivity` decorator
- ✅ **Rich Metadata**: Captures IP addresses, user agents, and action-specific details
- ✅ **Privacy-First**: Automatic sanitization of sensitive data (passwords, tokens, secrets)
- ✅ **Advanced Analytics**: Built-in trend analysis and anomaly detection
- ✅ **Flexible Filtering**: Filter by user, action, entity type, date range, etc.
- ✅ **Role-Based Access**: Users see their own activities, admins see everything
- ✅ **Performant**: Indexed queries and pagination for large datasets
- ✅ **Analytics-Ready**: Provides data foundation for dashboard visualizations

---

## Table of Contents

1. [Entity Schema](#entity-schema)
2. [Activity Actions](#activity-actions)
3. [Entity Types](#entity-types)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [Metadata Structure](#metadata-structure)
7. [Integration Guide](#integration-guide)
8. [Security & Privacy](#security--privacy)
9. [Analytics Features](#analytics-features)
10. [Best Practices](#best-practices)

---

## Entity Schema

### ActivityLog Entity

```typescript
{
  id: UUID,                    // Primary key
  userId: UUID | null,         // User who performed the action (nullable for system actions)
  action: ActivityAction,      // Type of action performed
  entityType: EntityType | null, // Type of entity affected
  entityId: UUID | null,       // ID of the affected entity
  metadata: JSONB | null,      // Flexible JSON storage for action details
  ipAddress: string | null,    // IP address of the requester
  userAgent: string | null,    // Browser/client user agent
  createdAt: timestamp         // When the action occurred (UTC)
}
```

### Indexes

For optimal query performance:

- `userId` - Fast lookups by user
- `action` - Filter by action type
- `entityType` - Filter by entity type
- `entityId` - Find all actions on specific entity
- `createdAt` - Time-based queries and sorting

---

## Activity Actions

### Authentication Actions

| Action | Description | Example Metadata |
|--------|-------------|------------------|
| `LOGIN` | User successfully logged in | `{ email, method: 'password' }` |
| `LOGOUT` | User logged out | `{ email }` |
| `REGISTER` | New user registered | `{ email }` |
| `PASSWORD_CHANGE` | User changed password | `{ email, changedAt }` |

### Team Actions

| Action | Description | Example Metadata |
|--------|-------------|------------------|
| `TEAM_CREATE` | New team created | `{ teamId, teamName }` |
| `TEAM_UPDATE` | Team details updated | `{ teamId, teamName, changes }` |
| `TEAM_DELETE` | Team deleted | `{ teamId, teamName }` |
| `TEAM_MEMBER_ADD` | Member added to team | `{ teamId, teamName, memberEmail, role }` |
| `TEAM_MEMBER_REMOVE` | Member removed from team | `{ teamId, teamName, memberEmail }` |
| `TEAM_MEMBER_ROLE_UPDATE` | Member role changed | `{ teamId, teamName, memberEmail, oldRole, newRole }` |

### Task Actions

| Action | Description | Example Metadata |
|--------|-------------|------------------|
| `TASK_CREATE` | New task created | `{ taskId, taskTitle, teamId, priority, status }` |
| `TASK_UPDATE` | Task details updated | `{ taskId, taskTitle, changes }` |
| `TASK_DELETE` | Task deleted | `{ taskId, taskTitle, teamId }` |
| `TASK_ASSIGN` | Task assigned to user | `{ taskId, taskTitle, assignedToEmail, teamId }` |
| `TASK_STATUS_CHANGE` | Task status changed | `{ taskId, taskTitle, oldStatus, newStatus, teamId }` |
| `TASK_PRIORITY_CHANGE` | Task priority changed | `{ taskId, taskTitle, oldPriority, newPriority, teamId }` |

### User Actions

| Action | Description | Example Metadata |
|--------|-------------|------------------|
| `USER_UPDATE` | User profile updated | `{ userId, email, changes }` |
| `USER_DELETE` | User account deleted | `{ userId, email }` |

---

## Entity Types

| Entity Type | Description |
|-------------|-------------|
| `USER` | User account |
| `TEAM` | Team/workspace |
| `TASK` | Task/issue |
| `TEAM_MEMBER` | Team membership |

---

## API Endpoints

All endpoints require JWT authentication and are role-based.

### Get All Activities (Admin Only)

```http
GET /api/v1/activity
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `action` (optional): Filter by action type
- `entityType` (optional): Filter by entity type
- `entityId` (optional): Filter by entity ID
- `startDate` (optional): ISO date string (e.g., "2025-01-01")
- `endDate` (optional): ISO date string
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "action": "task_create",
      "entityType": "task",
      "entityId": "uuid",
      "metadata": {
        "taskId": "uuid",
        "taskTitle": "Implement feature X",
        "teamId": "uuid",
        "priority": "high",
        "status": "todo"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-11-11T12:00:00.000Z",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get My Activities

```http
GET /api/v1/activity/me
Authorization: Bearer <access-token>
```

Returns activities performed by the current user. Supports same query parameters as above.

### Get Entity Activities

```http
GET /api/v1/activity/entity/:entityType/:entityId
Authorization: Bearer <access-token>
```

**Example:**
```http
GET /api/v1/activity/entity/task/550e8400-e29b-41d4-a716-446655440000
```

Returns all activities related to a specific entity.

### Get Team Activities

```http
GET /api/v1/activity/team/:teamId
Authorization: Bearer <access-token>
```

Returns all activities related to a team (team operations and team tasks).

### Get Recent Activities

```http
GET /api/v1/activity/recent?limit=10
Authorization: Bearer <access-token>
```

Returns the most recent activities (max 50).

### Get Activity Statistics

```http
GET /api/v1/activity/stats?userId=uuid&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "totalActions": 1250,
  "actionsByType": {
    "login": 150,
    "task_create": 200,
    "task_update": 450,
    "team_create": 10
  },
  "actionsByEntityType": {
    "task": 800,
    "team": 100,
    "user": 50
  },
  "recentActivity": [...],
  "mostActiveUsers": [
    {
      "userId": "uuid",
      "actionCount": 350
    }
  ]
}
```

---

## Usage Examples

### Example 1: Track Login Activity

This is automatically logged in [`AuthService`](backend/src/modules/auth/auth.service.ts):

```typescript
async login(loginDto: LoginDto): Promise<AuthResponse> {
  const user = await this.validateUser(loginDto.email, loginDto.password);
  
  // ... generate tokens ...
  
  // Log login activity
  await this.activityService.log({
    userId: user.id,
    action: ActivityAction.LOGIN,
    metadata: buildAuthMetadata('login', user.email),
  });
  
  return { user, ...tokens };
}
```

### Example 2: Automatic Logging with Decorator

In [`TeamsController`](backend/src/modules/teams/teams.controller.ts):

```typescript
@Post()
@LogActivity(ActivityAction.TEAM_CREATE, EntityType.TEAM)
async create(@Body() createTeamDto: CreateTeamDto) {
  // Activity is automatically logged after successful creation
  const team = await this.teamsService.create(userId, createTeamDto);
  return team;
}
```

The `@LogActivity` decorator works with the [`ActivityLoggingInterceptor`](backend/src/common/interceptors/activity-logging.interceptor.ts) to automatically capture:
- User ID from JWT token
- IP address from request
- User agent from request headers
- Entity ID from response
- Metadata from request/response

### Example 3: Manual Logging with Rich Metadata

```typescript
await this.activityService.log({
  userId: user.id,
  action: ActivityAction.TASK_STATUS_CHANGE,
  entityType: EntityType.TASK,
  entityId: task.id,
  metadata: buildTaskStatusChangeMetadata(
    task.id,
    task.title,
    oldStatus,
    newStatus,
    task.teamId
  ),
  ipAddress: this.activityService.extractIpAddress(request),
  userAgent: this.activityService.extractUserAgent(request),
});
```

### Example 4: Query User Activity

```typescript
const result = await this.activityService.findByUser(
  userId,
  {
    action: ActivityAction.TASK_CREATE,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    page: 1,
    limit: 20
  }
);
```

### Example 5: Get Team Activity Timeline

```typescript
const activities = await this.activityService.findByTeam(
  teamId,
  {
    startDate: '2025-11-01',
    limit: 50
  }
);
```

---

## Metadata Structure

Metadata is stored as flexible JSONB and varies by action type.

### Task Creation Metadata

```json
{
  "taskId": "uuid",
  "taskTitle": "Implement authentication",
  "taskDescription": "Add JWT authentication to API",
  "status": "todo",
  "priority": "high",
  "teamId": "uuid",
  "assignedToId": "uuid",
  "assignedToEmail": "developer@example.com",
  "dueDate": "2025-12-31T23:59:59.000Z"
}
```

### Task Status Change Metadata

```json
{
  "taskId": "uuid",
  "taskTitle": "Implement authentication",
  "oldStatus": "in_progress",
  "newStatus": "done",
  "teamId": "uuid"
}
```

### Team Member Addition Metadata

```json
{
  "teamId": "uuid",
  "teamName": "Development Team",
  "memberEmail": "newdev@example.com",
  "role": "member"
}
```

### User Profile Update Metadata

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "changes": {
    "firstName": {
      "old": "John",
      "new": "Jonathan"
    },
    "lastName": {
      "old": "Doe",
      "new": "Smith"
    }
  }
}
```

---

## Integration Guide

### Step 1: Use @LogActivity Decorator

For automatic logging, simply add the decorator to your controller method:

```typescript
import { LogActivity } from '../../common/decorators/log-activity.decorator';
import { ActivityAction } from '../activity/enums/activity-action.enum';
import { EntityType } from '../activity/enums/entity-type.enum';

@LogActivity(ActivityAction.TASK_UPDATE, EntityType.TASK)
@Patch(':id')
async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
  return this.service.update(id, dto);
}
```

### Step 2: Manual Logging in Services

For more control, inject `ActivityService` and log manually:

```typescript
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '../activity/enums/activity-action.enum';
import { EntityType } from '../activity/enums/entity-type.enum';
import { buildTaskMetadata } from '../activity/helpers/metadata-builder.helper';

@Injectable()
export class TasksService {
  constructor(
    private readonly activityService: ActivityService,
  ) {}
  
  async updateStatus(taskId: string, newStatus: TaskStatus) {
    const task = await this.findOne(taskId);
    const oldStatus = task.status;
    
    task.status = newStatus;
    await this.taskRepository.save(task);
    
    // Log the status change
    await this.activityService.log({
      userId: task.updatedById,
      action: ActivityAction.TASK_STATUS_CHANGE,
      entityType: EntityType.TASK,
      entityId: task.id,
      metadata: {
        taskTitle: task.title,
        oldStatus,
        newStatus,
        teamId: task.teamId
      }
    });
    
    return task;
  }
}
```

### Step 3: Use Metadata Builders

Use helper functions for consistent metadata:

```typescript
import { buildTaskMetadata, buildTeamMetadata, buildUserMetadata } from '../activity/helpers/metadata-builder.helper';

// For tasks
const metadata = buildTaskMetadata(task, { status: { old: 'todo', new: 'done' } });

// For teams
const metadata = buildTeamMetadata(team, { name: { old: 'Old Name', new: 'New Name' } });

// For users
const metadata = buildUserMetadata(user, { firstName: { old: 'John', new: 'Jane' } });
```

---

## Security & Privacy

### Automatic Data Sanitization

The system automatically removes sensitive fields from metadata:

**Sensitive Fields (Always Redacted):**
- `password`
- `passwordHash`
- `token`
- `accessToken`
- `refreshToken`
- `secret`
- `apiKey`
- `creditCard`
- `ssn`

**Example:**
```typescript
// Input
{
  email: "user@example.com",
  password: "SecretPassword123"
}

// Logged as
{
  email: "user@example.com",
  password: "[REDACTED]"
}
```

### IP Address Privacy

IP addresses are captured from trusted headers:
1. `X-Forwarded-For` (first IP if multiple)
2. `X-Real-IP`
3. Connection remote address (fallback)

### Access Control

- **Regular Users**: Can only view their own activities
- **Team Members**: Can view team-related activities
- **Admins**: Can view all activities across the system

### Data Retention

Admins can clean old logs (not implemented in UI yet):

```typescript
// Delete logs older than 90 days
await this.activityService.cleanOldLogs(90);
```

---

## Analytics Features

### Activity Trends

```typescript
import { getActivityTrends } from '../activity/helpers/activity-analytics.helper';

const trends = getActivityTrends(logs, 30); // 30-day period
// Returns: { trend: 'increasing', percentageChange: 25.5, ... }
```

### Activity Heatmap

```typescript
import { getActivityHeatmap } from '../activity/helpers/activity-analytics.helper';

const heatmap = getActivityHeatmap(logs);
// Returns 7x24 matrix (day of week x hour of day)
```

### Anomaly Detection

```typescript
import { detectAnomalies } from '../activity/helpers/activity-analytics.helper';

const anomalies = detectAnomalies(logs);
// Returns potential security issues:
// - Unusual activity volumes
// - Multiple failed login attempts
// - Off-hours activity patterns
```

### Timeline Data

```typescript
import { getTimelineData } from '../activity/helpers/activity-analytics.helper';

const timeline = getTimelineData(logs, 'day'); // or 'week', 'month'
// Returns data suitable for chart visualization
```

---

## Best Practices

### 1. Always Log Important Actions

Ensure all critical operations are logged:
- ✅ Authentication events
- ✅ Data creation, modification, deletion
- ✅ Permission changes
- ✅ Configuration changes

### 2. Use Descriptive Metadata

Provide context in metadata:

```typescript
// Good - Descriptive metadata
metadata: {
  taskTitle: "Implement login feature",
  oldStatus: "in_progress",
  newStatus: "done",
  teamName: "Backend Team",
  completedBy: "developer@example.com"
}

// Bad - Minimal metadata
metadata: {
  id: "uuid",
  status: "done"
}
```

### 3. Never Log Sensitive Data

Even though automatic sanitization exists, avoid including sensitive data:

```typescript
// Bad
metadata: {
  email: user.email,
  password: user.password  // Never do this!
}

// Good
metadata: {
  email: user.email,
  passwordChanged: true
}
```

### 4. Use Batch Operations for Analytics

When analyzing large datasets, use database-level aggregations:

```typescript
// Good - Let database handle aggregation
const stats = await this.activityService.getActivityStats(userId, startDate, endDate);

// Avoid - Loading all data into memory
const allLogs = await this.activityService.findAll({});
const stats = calculateStats(allLogs);
```

### 5. Implement Data Retention Policies

Regularly clean old logs to manage database size:

```typescript
// Clean logs older than 1 year
await this.activityService.cleanOldLogs(365);
```

### 6. Monitor for Anomalies

Regularly check for unusual activity:

```typescript
const recentLogs = await this.activityService.findRecent(1000);
const anomalies = detectAnomalies(recentLogs);

if (anomalies.some(a => a.severity === 'high')) {
  // Alert security team
}
```

---

## Testing Activity Logging

### Test Activity Creation

```bash
# Create a team (should auto-log)
curl -X POST http://localhost:3000/api/v1/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Team", "description": "Testing activity logging"}'

# Check activity logs
curl http://localhost:3000/api/v1/activity/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test Activity Filtering

```bash
# Get activities for specific action
curl "http://localhost:3000/api/v1/activity/me?action=team_create" \
  -H "Authorization: Bearer $TOKEN"

# Get activities in date range
curl "http://localhost:3000/api/v1/activity/me?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Test Activity Statistics

```bash
# Get activity stats
curl "http://localhost:3000/api/v1/activity/stats?startDate=2025-01-01" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### Activities Not Being Logged

**Check:**
1. Is the `@LogActivity` decorator applied?
2. Is the `ActivityModule` imported in `AppModule`?
3. Are there any errors in the console?
4. Is the database connection working?

### Missing Metadata

**Check:**
1. Is the metadata being built correctly?
2. Are sensitive fields being redacted?
3. Is the interceptor capturing response data?

### Performance Issues

**Solutions:**
1. Ensure database indexes are created
2. Use pagination for large datasets
3. Implement caching for statistics
4. Archive old logs to separate storage

---

## Future Enhancements

Planned improvements for future phases:

- [ ] Real-time activity feed via WebSockets
- [ ] Advanced anomaly detection algorithms
- [ ] Export activities to CSV/JSON
- [ ] Activity replay for debugging
- [ ] Compliance reporting (GDPR, HIPAA)
- [ ] Machine learning for behavior analysis
- [ ] Integration with external SIEM systems

---

## Related Documentation

- [Backend README](./README.md) - Main backend documentation
- [API Teams & Tasks](./API-TEAMS-TASKS.md) - Teams and tasks API documentation
- [Architecture Document](../ARCHITECTURE.md) - Overall system architecture

---

**Built with security and compliance in mind** 🔒
