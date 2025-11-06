# TaskForge API - Teams & Tasks Documentation

Complete API documentation for Teams and Tasks management endpoints.

## Table of Contents

- [Teams Management](#teams-management)
- [Tasks Management](#tasks-management)
- [Team Tasks](#team-tasks)
- [Permission Matrix](#permission-matrix)
- [Business Rules](#business-rules)

---

## 🏢 Teams Management

All team endpoints require authentication (JWT token in Authorization header).

### Create Team

Create a new team. The creator automatically becomes the team OWNER.

**Endpoint:** `POST /api/v1/teams`  
**Access:** Protected (any authenticated user)

**Request Body:**

```json
{
  "name": "Development Team",
  "description": "Main development team for the project"
}
```

**Validation:**
- `name`: 3-100 characters (required)
- `description`: Max 500 characters (optional)

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Development Team",
    "description": "Main development team for the project",
    "ownerId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2025-11-04T06:00:00.000Z",
    "updatedAt": "2025-11-04T06:00:00.000Z"
  },
  "message": "Team created successfully",
  "timestamp": "2025-11-04T06:00:00.000Z"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/teams \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Development Team",
    "description": "Main development team"
  }'
```

---

### Get My Teams

Get all teams where the current user is a member.

**Endpoint:** `GET /api/v1/teams`  
**Access:** Protected

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Development Team",
      "description": "Main development team",
      "ownerId": "123e4567-e89b-12d3-a456-426614174000",
      "createdAt": "2025-11-04T06:00:00.000Z",
      "updatedAt": "2025-11-04T06:00:00.000Z",
      "owner": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "owner@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

**Example:**

```bash
curl http://localhost:3000/api/v1/teams \
  -H "Authorization: Bearer your-access-token"
```

---

### Get Team Details

Get details of a specific team (must be a member).

**Endpoint:** `GET /api/v1/teams/:id`  
**Access:** Protected (team members only)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Development Team",
    "description": "Main development team",
    "ownerId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2025-11-04T06:00:00.000Z",
    "updatedAt": "2025-11-04T06:00:00.000Z",
    "owner": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "owner@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

### Update Team

Update team details (OWNER and ADMIN only).

**Endpoint:** `PATCH /api/v1/teams/:id`  
**Access:** Protected (OWNER/ADMIN)

**Request Body:**

```json
{
  "name": "Updated Team Name",
  "description": "Updated description"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Team Name",
    "description": "Updated description",
    "ownerId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2025-11-04T06:00:00.000Z",
    "updatedAt": "2025-11-04T06:30:00.000Z"
  },
  "message": "Team updated successfully"
}
```

---

### Delete Team

Delete a team (OWNER only). This will cascade delete all members and tasks.

**Endpoint:** `DELETE /api/v1/teams/:id`  
**Access:** Protected (OWNER only)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Team deleted successfully"
}
```

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/v1/teams/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer your-access-token"
```

---

### Get Team Members

Get all members of a team with their details.

**Endpoint:** `GET /api/v1/teams/:id/members`  
**Access:** Protected (team members only)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "member-uuid-1",
      "teamId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "role": "owner",
      "joinedAt": "2025-11-04T06:00:00.000Z",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "owner@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "member",
        "avatarUrl": null
      }
    },
    {
      "id": "member-uuid-2",
      "teamId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "987e6543-e21b-12d3-a456-426614174999",
      "role": "admin",
      "joinedAt": "2025-11-04T07:00:00.000Z",
      "user": {
        "id": "987e6543-e21b-12d3-a456-426614174999",
        "email": "admin@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "role": "member",
        "avatarUrl": null
      }
    }
  ]
}
```

---

### Add Team Member

Add a new member to the team (OWNER and ADMIN only).

**Endpoint:** `POST /api/v1/teams/:id/members`  
**Access:** Protected (OWNER/ADMIN)

**Request Body:**

```json
{
  "userId": "987e6543-e21b-12d3-a456-426614174999",
  "role": "member"
}
```

**Validation:**
- `userId`: Valid UUID of existing user (required)
- `role`: Must be "admin" or "member" - cannot assign "owner" (required)

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "member-uuid-3",
    "teamId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "987e6543-e21b-12d3-a456-426614174999",
    "role": "member",
    "joinedAt": "2025-11-04T06:00:00.000Z"
  },
  "message": "Member added successfully"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/teams/550e8400-e29b-41d4-a716-446655440000/members \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "987e6543-e21b-12d3-a456-426614174999",
    "role": "member"
  }'
```

---

### Remove Team Member

Remove a member from the team (OWNER/ADMIN).

**Endpoint:** `DELETE /api/v1/teams/:id/members/:memberId`  
**Access:** Protected (OWNER can remove anyone, ADMIN can remove MEMBER only)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

**Business Rules:**
- OWNER cannot be removed (only transferred - not yet implemented)
- ADMIN can only remove members with MEMBER role
- OWNER can remove ADMIN and MEMBER roles
- Cannot remove yourself

---

### Update Member Role

Update a team member's role (OWNER only).

**Endpoint:** `PATCH /api/v1/teams/:id/members/:memberId/role`  
**Access:** Protected (OWNER only)

**Request Body:**

```json
{
  "role": "admin"
}
```

**Validation:**
- `role`: Must be "admin" or "member" (required)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "member-uuid-2",
    "teamId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "987e6543-e21b-12d3-a456-426614174999",
    "role": "admin",
    "joinedAt": "2025-11-04T06:00:00.000Z"
  },
  "message": "Member role updated successfully"
}
```

---

## 📋 Tasks Management

All task endpoints require authentication.

### Create Task

Create a new task in a team.

**Endpoint:** `POST /api/v1/tasks`  
**Access:** Protected (team members only)

**Request Body:**

```json
{
  "title": "Implement authentication",
  "description": "Set up JWT authentication for the API",
  "status": "todo",
  "priority": "high",
  "teamId": "550e8400-e29b-41d4-a716-446655440000",
  "assignedToId": "987e6543-e21b-12d3-a456-426614174999",
  "dueDate": "2025-12-31T23:59:59Z"
}
```

**Validation:**
- `title`: 3-200 characters (required)
- `description`: Max 2000 characters (optional)
- `status`: "todo", "in_progress", "in_review", "done", "archived" (default: "todo")
- `priority`: "low", "medium", "high", "urgent" (default: "medium")
- `teamId`: Valid team UUID (required, user must be member)
- `assignedToId`: Valid user UUID (optional, must be team member)
- `dueDate`: ISO 8601 date string (optional)

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "task-uuid-1",
    "title": "Implement authentication",
    "description": "Set up JWT authentication for the API",
    "status": "todo",
    "priority": "high",
    "teamId": "550e8400-e29b-41d4-a716-446655440000",
    "assignedToId": "987e6543-e21b-12d3-a456-426614174999",
    "createdById": "123e4567-e89b-12d3-a456-426614174000",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "createdAt": "2025-11-04T06:00:00.000Z",
    "updatedAt": "2025-11-04T06:00:00.000Z"
  },
  "message": "Task created successfully"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement authentication",
    "description": "Set up JWT authentication",
    "priority": "high",
    "teamId": "550e8400-e29b-41d4-a716-446655440000",
    "dueDate": "2025-12-31T23:59:59Z"
  }'
```

---

### Get All Tasks (with Filtering)

Get all tasks from your teams with advanced filtering and pagination.

**Endpoint:** `GET /api/v1/tasks`  
**Access:** Protected

**Query Parameters:**
- `status`: Filter by status (todo, in_progress, in_review, done, archived)
- `priority`: Filter by priority (low, medium, high, urgent)
- `assignedToId`: Filter by assigned user UUID
- `teamId`: Filter by team UUID
- `search`: Search in title and description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (createdAt, dueDate, priority, status - default: createdAt)
- `sortOrder`: Sort order (ASC, DESC - default: DESC)

**Example Request:**

```bash
curl "http://localhost:3000/api/v1/tasks?status=in_progress&priority=high&page=1&limit=20" \
  -H "Authorization: Bearer your-access-token"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "task-uuid-1",
        "title": "Implement authentication",
        "description": "Set up JWT authentication",
        "status": "in_progress",
        "priority": "high",
        "teamId": "550e8400-e29b-41d4-a716-446655440000",
        "assignedToId": "987e6543-e21b-12d3-a456-426614174999",
        "createdById": "123e4567-e89b-12d3-a456-426614174000",
        "dueDate": "2025-12-31T23:59:59.000Z",
        "createdAt": "2025-11-04T06:00:00.000Z",
        "updatedAt": "2025-11-04T06:30:00.000Z",
        "assignedTo": {
          "id": "987e6543-e21b-12d3-a456-426614174999",
          "email": "dev@example.com",
          "firstName": "Jane",
          "lastName": "Doe"
        },
        "createdBy": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "email": "admin@example.com",
          "firstName": "John",
          "lastName": "Smith"
        },
        "team": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Development Team"
        }
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### Get My Assigned Tasks

Get tasks assigned to the current user.

**Endpoint:** `GET /api/v1/tasks/me`  
**Access:** Protected

**Query Parameters:** Same as "Get All Tasks"

**Success Response (200 OK):** Same format as "Get All Tasks"

**Example:**

```bash
curl "http://localhost:3000/api/v1/tasks/me?status=in_progress" \
  -H "Authorization: Bearer your-access-token"
```

---

### Get Task Details

Get details of a specific task.

**Endpoint:** `GET /api/v1/tasks/:id`  
**Access:** Protected (team members only)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "task-uuid-1",
    "title": "Implement authentication",
    "description": "Set up JWT authentication for the API",
    "status": "in_progress",
    "priority": "high",
    "teamId": "550e8400-e29b-41d4-a716-446655440000",
    "assignedToId": "987e6543-e21b-12d3-a456-426614174999",
    "createdById": "123e4567-e89b-12d3-a456-426614174000",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "createdAt": "2025-11-04T06:00:00.000Z",
    "updatedAt": "2025-11-04T06:30:00.000Z",
    "assignedTo": {
      "id": "987e6543-e21b-12d3-a456-426614174999",
      "email": "dev@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "member"
    },
    "createdBy": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "admin"
    },
    "team": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Development Team",
      "description": "Main development team"
    }
  }
}
```

---

### Update Task

Update task details (creator, assignee, or team ADMIN/OWNER).

**Endpoint:** `PATCH /api/v1/tasks/:id`  
**Access:** Protected (task creator, assignee, or team ADMIN/OWNER)

**Request Body:**

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "urgent",
  "assignedToId": "987e6543-e21b-12d3-a456-426614174999",
  "dueDate": "2025-12-31T23:59:59Z"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "task-uuid-1",
    "title": "Updated title",
    "description": "Updated description",
    "status": "in_progress",
    "priority": "urgent",
    "teamId": "550e8400-e29b-41d4-a716-446655440000",
    "assignedToId": "987e6543-e21b-12d3-a456-426614174999",
    "createdById": "123e4567-e89b-12d3-a456-426614174000",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "createdAt": "2025-11-04T06:00:00.000Z",
    "updatedAt": "2025-11-04T07:00:00.000Z"
  },
  "message": "Task updated successfully"
}
```

---

### Delete Task

Delete a task (creator or team ADMIN/OWNER).

**Endpoint:** `DELETE /api/v1/tasks/:id`  
**Access:** Protected (task creator or team ADMIN/OWNER)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### Assign Task

Assign or reassign a task to a team member.

**Endpoint:** `PATCH /api/v1/tasks/:id/assign`  
**Access:** Protected (team ADMIN/OWNER or task creator)

**Request Body:**

```json
{
  "assignedToId": "987e6543-e21b-12d3-a456-426614174999"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "task-uuid-1",
    "title": "Implement authentication",
    "description": "Set up JWT authentication",
    "status": "todo",
    "priority": "high",
    "teamId": "550e8400-e29b-41d4-a716-446655440000",
    "assignedToId": "987e6543-e21b-12d3-a456-426614174999",
    "createdById": "123e4567-e89b-12d3-a456-426614174000",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "createdAt": "2025-11-04T06:00:00.000Z",
    "updatedAt": "2025-11-04T07:00:00.000Z"
  },
  "message": "Task assigned successfully"
}
```

---

### Update Task Status

Update only the status of a task.

**Endpoint:** `PATCH /api/v1/tasks/:id/status`  
**Access:** Protected (task assignee, creator, or team ADMIN/OWNER)

**Request Body:**

```json
{
  "status": "done"
}
```

**Validation:**
- `status`: Must be one of: "todo", "in_progress", "in_review", "done", "archived"

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "task-uuid-1",
    "title": "Implement authentication",
    "description": "Set up JWT authentication",
    "status": "done",
    "priority": "high",
    "teamId": "550e8400-e29b-41d4-a716-446655440000",
    "assignedToId": "987e6543-e21b-12d3-a456-426614174999",
    "createdById": "123e4567-e89b-12d3-a456-426614174000",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "createdAt": "2025-11-04T06:00:00.000Z",
    "updatedAt": "2025-11-04T08:00:00.000Z"
  },
  "message": "Task status updated successfully"
}
```

---

## 📊 Team Tasks

### Get Team Tasks

Get all tasks for a specific team with filtering.

**Endpoint:** `GET /api/v1/teams/:teamId/tasks`  
**Access:** Protected (team members only)

**Query Parameters:** Same as "Get All Tasks"

**Success Response (200 OK):** Same format as "Get All Tasks"

**Example:**

```bash
curl "http://localhost:3000/api/v1/teams/550e8400-e29b-41d4-a716-446655440000/tasks?status=in_progress&limit=20" \
  -H "Authorization: Bearer your-access-token"
```

---

### Get Team Task Statistics

Get task statistics for a team for analytics purposes.

**Endpoint:** `GET /api/v1/teams/:teamId/tasks/stats`  
**Access:** Protected (team members only)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalTasks": 150,
    "todoTasks": 45,
    "inProgressTasks": 35,
    "inReviewTasks": 15,
    "doneTasks": 50,
    "archivedTasks": 5,
    "tasksByPriority": {
      "low": 30,
      "medium": 80,
      "high": 30,
      "urgent": 10
    }
  }
}
```

**Example:**

```bash
curl http://localhost:3000/api/v1/teams/550e8400-e29b-41d4-a716-446655440000/tasks/stats \
  -H "Authorization: Bearer your-access-token"
```

---

## 🔐 Permission Matrix

### Team Roles & Permissions

| Permission | OWNER | ADMIN | MEMBER |
|------------|:-----:|:-----:|:------:|
| View team details | ✅ | ✅ | ✅ |
| View team members | ✅ | ✅ | ✅ |
| Update team info | ✅ | ✅ | ❌ |
| Delete team | ✅ | ❌ | ❌ |
| Add members | ✅ | ✅ | ❌ |
| Remove MEMBER | ✅ | ✅ | ❌ |
| Remove ADMIN | ✅ | ❌ | ❌ |
| Change member roles | ✅ | ❌ | ❌ |
| Create tasks | ✅ | ✅ | ✅ |
| View team tasks | ✅ | ✅ | ✅ |

### Task Permissions

| Permission | OWNER | ADMIN | Creator | Assignee | Other Members |
|------------|:-----:|:-----:|:-------:|:--------:|:-------------:|
| Create task | ✅ | ✅ | ✅ | ✅ | ✅ |
| View team tasks | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update any task | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update own created/assigned task | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete any task | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete own created task | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign/reassign tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update task status | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 📜 Business Rules

### Team Management Rules

1. **Team Creation**
   - User automatically becomes OWNER when creating a team
   - OWNER role is automatically assigned to the creator

2. **Team Deletion**
   - Only OWNER can delete a team
   - Deletion cascades to all members and tasks
   - Warning: This action is irreversible

3. **OWNER Role**
   - Each team has exactly one OWNER
   - OWNER cannot be removed from the team
   - OWNER can only transfer ownership (feature not yet implemented)

4. **Member Management**
   - ADMIN can add/remove MEMBER but not other ADMINs
   - OWNER can add/remove both ADMIN and MEMBER
   - Cannot remove yourself from the team
   - Duplicate members are not allowed (enforced by database constraint)

5. **Role Assignment**
   - OWNER role cannot be directly assigned
   - Only OWNER can promote members to ADMIN
   - ADMIN and OWNER can add members with MEMBER role

### Task Management Rules

1. **Task Creation**
   - Only team members can create tasks
   - Creator is automatically set as `createdBy`
   - Default status is "TODO" if not specified
   - Default priority is "MEDIUM" if not specified

2. **Task Assignment**
   - Assigned user (`assignedToId`) must be a team member
   - Tasks can be unassigned (set `assignedToId` to null)
   - Team ADMIN/OWNER or task creator can assign tasks

3. **Task Visibility**
   - Only team members can see team tasks
   - Members cannot see tasks from teams they don't belong to

4. **Task Modification**
   - Task creator can update/delete their own tasks
   - Task assignee can update the task and change status
   - Team ADMIN/OWNER can update/delete any team task

5. **Task Status Updates**
   - Status can be updated by: assignee, creator, or team admins
   - Valid statuses: TODO, IN_PROGRESS, IN_REVIEW, DONE, ARCHIVED
   - Status transitions are not enforced (can jump between any statuses)

6. **Task Deletion**
   - Only task creator or team ADMIN/OWNER can delete tasks
   - Deletion is permanent and immediate

### Data Validation Rules

1. **Team Names**
   - Must be 3-100 characters
   - No uniqueness constraint (teams can have same names)

2. **Task Titles**
   - Must be 3-200 characters
   - Required field

3. **Descriptions**
   - Team: Max 500 characters (optional)
   - Task: Max 2000 characters (optional)

4. **Due Dates**
   - Must be valid ISO 8601 date strings
   - Can be in the past (no validation)
   - Optional field

5. **UUIDs**
   - All IDs must be valid UUIDs (version 4)
   - Validated by class-validator

### Pagination & Filtering

1. **Default Values**
   - Page: 1
   - Limit: 10
   - Sort By: createdAt
   - Sort Order: DESC

2. **Limits**
   - Maximum items per page: 100
   - Minimum page number: 1
   - Minimum limit: 1

3. **Search**
   - Searches in both title and description
   - Case-insensitive (ILIKE)
   - Partial matching supported

---

## 🚨 Error Responses

All endpoints use standard error response format:

```json
{
  "success": false,
  "error": {
    "statusCode": 403,
    "message": "You do not have permission to update this team",
    "error": "Forbidden",
    "timestamp": "2025-11-04T06:00:00.000Z",
    "path": "/api/v1/teams/550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Common HTTP Status Codes

- `200` - Success (GET, PATCH, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation error, invalid data)
- `401` - Unauthorized (authentication required, invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource, invalid state)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Common Error Scenarios

**Teams:**
- `404` - Team not found
- `403` - Not a team member
- `403` - Insufficient permissions (not OWNER/ADMIN)
- `409` - User already a team member
- `400` - Invalid team data

**Tasks:**
- `404` - Task not found
- `403` - Not a team member (cannot access task)
- `403` - Cannot modify task (not creator/assignee/admin)
- `400` - Assigned user not a team member
- `400` - Invalid task data

---

**Built with ❤️ using NestJS and TypeScript**