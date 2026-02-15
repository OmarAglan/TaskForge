# WebSocket Documentation

This document describes the WebSocket real-time features implemented in TaskForge backend.

## Overview

The backend uses Socket.io to provide real-time bidirectional communication between the server and clients. This enables instant updates without the need for polling.

## Architecture

### Components

1. **EventsGateway** (`src/modules/websocket/events.gateway.ts`)
   - Main WebSocket gateway
   - Handles client connections and disconnections
   - Manages room memberships
   - Broadcasts events to users

2. **WebSocketService** (`src/modules/websocket/websocket.service.ts`)
   - Provides methods to emit events
   - Used by other services to send real-time updates

3. **WebSocket Module** (`src/modules/websocket/websocket.module.ts`)
   - Module configuration
   - Dependency injection setup

## Connection

### Endpoint

```
ws://localhost:3000/socket.io/?token=<JWT_TOKEN>
```

### Authentication

Clients must authenticate using a JWT token passed in one of these ways:

1. **Query Parameter** (recommended):
   ```
   ws://localhost:3000/socket.io/?token=<JWT_ACCESS_TOKEN>
   ```

2. **Auth Object**:
   ```javascript
   io.connect('http://localhost:3000', {
     auth: {
       token: '<JWT_ACCESS_TOKEN>'
     },
     transports: ['websocket']
   });
   ```

### CORS Configuration

The gateway is configured with CORS support:
- Origin: Configurable via environment
- Methods: All methods allowed
- Credentials: Supported

## Events

### Connection Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Server → Client | Client successfully connected |
| `disconnect` | Server → Client | Client disconnected |
| `authenticate` | Client → Server | Manual authentication (if needed) |

### Task Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `task:created` | Server → Client | Task created |
| `task:updated` | Server → Client | Task updated |
| `task:deleted` | Server → Client | Task deleted |
| `task:assigned` | Server → Client | Task assigned to user |
| `task:status_changed` | Server → Client | Task status changed |
| `task:comment_added` | Server → Client | Comment added to task |

### Team Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `team:created` | Server → Client | Team created |
| `team:updated` | Server → Client | Team updated |
| `team:deleted` | Server → Client | Team deleted |
| `team:member_added` | Server → Client | Member added to team |
| `team:member_removed` | Server → Client | Member removed from team |
| `team:member_role_changed` | Server → Client | Member role changed |

### Notification Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `notification:new` | Server → Client | New notification |
| `notification:read` | Server → Client | Notification marked as read |

### Presence Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `user:online` | Server → Client | User came online |
| `user:offline` | Server → Client | User went offline |
| `user:typing` | Server → Client | User is typing |

### Activity Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `activity:new` | Server → Client | New activity logged |

## Room Management

### Joining Rooms

Users automatically join rooms based on their team memberships:

```typescript
// Join a team room
client.join(`team:${teamId}`);
```

### Leaving Rooms

Rooms are automatically left on disconnect:

```typescript
// Leave a team room
client.leave(`team:${teamId}`);
```

### Room Structure

- `team:{teamId}` - All members of a team
- `user:{userId}` - User-specific room (for private notifications)

## Emitting Events

### From Services

Use the WebSocketService to emit events:

```typescript
constructor(private readonly websocketService: WebSocketService) {}

// Emit to team members
this.websocketService.emitTaskCreated(task, userId);

// Emit to specific user
this.websocketService.emitNotification(userId, notification);
```

### Available Methods

#### Task Events

- `emitTaskCreated(task, userId)` - Notify team of new task
- `emitTaskUpdated(task, userId, changes)` - Notify of task update
- `emitTaskDeleted(taskId, teamId, userId)` - Notify of task deletion
- `emitTaskAssigned(task, assigneeId, userId)` - Notify assignee
- `emitTaskStatusChanged(task, oldStatus, newStatus, userId)` - Notify team

#### Team Events

- `emitTeamCreated(team, userId)` - Notify all users
- `emitTeamUpdated(team, userId)` - Notify team
- `emitTeamDeleted(teamId, userId)` - Notify team
- `emitTeamMemberAdded(team, member, userId)` - Notify team
- `emitTeamMemberRemoved(team, memberId, userId)` - Notify team
- `emitTeamMemberRoleChanged(team, memberId, oldRole, newRole, userId)` - Notify team

#### Notification Events

- `emitNotification(userId, notification)` - Send to user
- `emitNotificationRead(userId, notificationId)` - Notify read

#### Presence Events

- `emitUserOnline(userId)` - Broadcast online status
- `emitUserOffline(userId)` - Broadcast offline status

## Payload Types

### TaskEventPayload

```typescript
interface TaskEventPayload {
  taskId: string;
  task: Task;
  teamId: string;
  userId: string;
  action: string;
  timestamp: string;
}
```

### TeamEventPayload

```typescript
interface TeamEventPayload {
  teamId: string;
  team: Team;
  userId: string;
  action: string;
  timestamp: string;
}
```

### NotificationPayload

```typescript
interface NotificationPayload {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  createdAt: string;
}
```

## Error Handling

### Connection Errors

| Error | Description | Handling |
|-------|-------------|----------|
| Invalid token | JWT validation failed | Reject connection |
| Token expired | Token has expired | Prompt re-authentication |
| Rate limit | Too many connections | Implement backoff |

### Event Errors

Errors during event emission are logged but don't crash the server:

```typescript
try {
  this.server.to(`team:${teamId}`).emit('task:created', payload);
} catch (error) {
  this.logger.error(`Failed to emit task:created event`, error);
}
```

## Security

### Authentication

All WebSocket connections require JWT authentication:

1. Token is validated on connection
2. User ID is extracted from token
3. User is attached to socket data
4. Unauthorized connections are rejected

### Authorization

Events are only sent to authorized users:

1. Check team membership before sending team events
2. Verify notification ownership
3. Validate user permissions

### Rate Limiting

WebSocket connections are rate-limited to prevent abuse:

- Connection attempts: 100 per 15 minutes
- Events per second: 10 per connection

## Environment Variables

Add these to your `.env` file:

```env
# WebSocket
WS_PORT=3000
WS_PATH=/socket.io
WS_CORS_ORIGIN=http://localhost:5173
```

## Testing

### Using Socket.io Client

```bash
npm install -D @types/socket.io-client
```

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('task:created', (task) => {
  console.log('New task created:', task);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

### Test Scenarios

1. **Connection**
   - Connect with valid JWT → Should succeed
   - Connect with invalid JWT → Should fail with 401
   - Connect with no token → Should fail with 401

2. **Task Events**
   - Create task → Team members receive `task:created`
   - Update task → Team members receive `task:updated`
   - Delete task → Team members receive `task:deleted`

3. **Team Events**
   - Add member → Team receives `team:member_added`
   - Remove member → Team receives `team:member_removed`
   - Change role → Member receives `team:member_role_changed`

4. **Notifications**
   - Task assigned → Assignee receives `notification:new`
   - Mark as read → User receives `notification:read`

## Integration

### With Tasks Service

The TasksService automatically emits WebSocket events:

```typescript
// tasks.service.ts
async create(createTaskDto: CreateTaskDto, userId: string) {
  const task = await this.taskRepository.create({
    ...createTaskDto,
    createdBy: userId,
  });
  
  // Emit real-time event
  await this.websocketService.emitTaskCreated(task, userId);
  
  return task;
}
```

### With Teams Service

The TeamsService automatically emits WebSocket events:

```typescript
// teams.service.ts
async addMember(teamId: string, addMemberDto: AddMemberDto, userId: string) {
  const member = await this.teamMemberRepository.create({
    ...addMemberDto,
    teamId,
  });
  
  // Emit real-time event
  await this.websocketService.emitTeamMemberAdded(team, member, userId);
  
  return member;
}
```

## Performance

### Optimizations

1. **Room-based Broadcasting**: Use rooms to target specific groups
2. **Binary Data**: Use binary format for large payloads
3. **Heartbeat**: Keep connections alive with ping/pong
4. **Cleanup**: Remove stale connections regularly

### Monitoring

Track these metrics:

- Active connections
- Messages per second
- Average latency
- Error rate
- Connection duration

## Troubleshooting

### Connection Issues

1. **CORS errors**: Check `WS_CORS_ORIGIN` environment variable
2. **Authentication failures**: Verify JWT token is valid
3. **Port conflicts**: Check `WS_PORT` is not in use

### Event Issues

1. **Missing events**: Check user is in the correct room
2. **Duplicate events**: Verify only one listener is registered
3. **Stale data**: Implement proper cleanup on disconnect

### Memory Leaks

1. **Listeners**: Always remove listeners on component unmount
2. **Connections**: Clean up disconnected sockets
3. **Rooms**: Leave rooms on disconnect

## Best Practices

1. **Always authenticate**: Reject unauthenticated connections
2. **Use rooms**: Group users for efficient broadcasting
3. **Handle errors**: Don't crash on emit failures
4. **Log events**: Track important events for debugging
5. **Validate payloads**: Sanitize all incoming data
6. **Clean up**: Remove listeners and leave rooms on disconnect
7. **Type safety**: Use TypeScript interfaces for payloads

## API Reference

### WebSocketService

```typescript
class WebSocketService {
  constructor(private gateway: EventsGateway) {}
  
  // Task emissions
  emitTaskCreated(task: Task, userId: string): Promise<void>
  emitTaskUpdated(task: Task, userId: string, changes: any): Promise<void>
  emitTaskDeleted(taskId: string, teamId: string, userId: string): Promise<void>
  emitTaskAssigned(task: Task, assigneeId: string, userId: string): Promise<void>
  emitTaskStatusChanged(task: Task, oldStatus: string, newStatus: string, userId: string): Promise<void>
  
  // Team emissions
  emitTeamCreated(team: Team, userId: string): Promise<void>
  emitTeamUpdated(team: Team, userId: string): Promise<void>
  emitTeamDeleted(teamId: string, userId: string): Promise<void>
  emitTeamMemberAdded(team: Team, member: TeamMember, userId: string): Promise<void>
  emitTeamMemberRemoved(team: Team, memberId: string, userId: string): Promise<void>
  emitTeamMemberRoleChanged(team: Team, memberId: string, oldRole: string, newRole: string, userId: string): Promise<void>
  
  // Notification emissions
  emitNotification(userId: string, notification: Notification): Promise<void>
  emitNotificationRead(userId: string, notificationId: string): Promise<void>
  
  // Presence emissions
  emitUserOnline(userId: string): Promise<void>
  emitUserOffline(userId: string): Promise<void>
}
```

## Next Steps

- Implement typing indicators
- Add message read receipts
- Implement online presence awareness
- Add support for push notifications
- Add message history/caching
