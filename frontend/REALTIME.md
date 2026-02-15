# Real-Time Features Documentation

This document describes the real-time features implemented in the TaskForge frontend.

## Overview

The frontend uses Socket.io-client to connect to the backend WebSocket server and receive real-time updates for:
- Task changes
- Team member updates
- Notifications
- User presence

## WebSocket Service

The main WebSocket service is located at `src/services/websocket/websocket.service.ts`.

### Features

- **Auto-reconnection**: Automatically reconnects on disconnect with exponential backoff
- **Event queuing**: Queues events while disconnected and replays on reconnect
- **Multi-tab support**: Handles multiple browser tabs
- **Type-safe listeners**: Type-safe event registration

### API

```typescript
// Connect to server
websocketService.connect(token: string);

// Disconnect
websocketService.disconnect();

// Register event listener
websocketService.on(event: string, callback: Function);

// Remove event listener
websocketService.off(event: string, callback?: Function);

// Emit event to server
websocketService.emit(event: string, data: any);

// Join team room
websocketService.joinTeam(teamId: string);

// Leave team room
websocketService.leaveTeam(teamId: string);
```

## Hooks

### useWebSocket

Main hook for managing WebSocket connection.

```typescript
const { isConnected, connectionState, websocketService } = useWebSocket();
```

**Returns:**
- `isConnected`: Boolean connection status
- `connectionState`: 'connected' | 'connecting' | 'disconnected'
- `websocketService`: The service instance

### useRealtimeTasks

Hook for receiving real-time task updates.

```typescript
// For all tasks
useRealtimeTasks();

// For specific team
useRealtimeTasks(teamId);
```

**Events handled:**
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `task:status_changed` - Task status changed
- `task:assigned` - Task assigned

### useRealtimeTeams

Hook for receiving real-time team updates.

```typescript
useRealtimeTeams();
```

**Events handled:**
- `team:created` - New team created
- `team:updated` - Team updated
- `team:deleted` - Team deleted
- `team:member_added` - Member added
- `team:member_removed` - Member removed
- `team:member_role_changed` - Member role changed

### useNotifications

Hook for managing notifications.

```typescript
const { 
  notifications, 
  unreadCount, 
  isLoading,
  markAsRead,
  markAllAsRead,
  deleteNotification 
} = useNotifications();
```

## Components

### NotificationBell

Bell icon with unread notification badge.

```tsx
import { NotificationBell } from './components/notifications';

<NotificationBell />
```

### NotificationsList

Full page list of notifications with filtering.

```tsx
import { NotificationsList } from './components/notifications';

<NotificationsList
  notifications={notifications}
  isLoading={isLoading}
  unreadCount={unreadCount}
  onMarkAsRead={markAsRead}
  onMarkAllAsRead={markAllAsRead}
  onDelete={deleteNotification}
/>
```

### ConnectionStatus

Shows WebSocket connection status.

```tsx
import { ConnectionStatus } from './components/common';

// Small indicator (default)
<ConnectionStatus />

// With label
<ConnectionStatus showLabel />

// Medium size
<ConnectionStatus size="medium" />
```

### OnlineIndicator

Shows online/offline status for users.

```tsx
import { OnlineIndicator } from './components/presence';

<OnlineIndicator isOnline={true} size="small" />
```

### UserPresence

User avatar with online indicator.

```tsx
import { UserPresence } from './components/presence';

<UserPresence 
  user={user} 
  isOnline={true}
  showIndicator={true}
  size="medium"
/>
```

## Event Types

All event types are defined in `src/types/websocket.types.ts`:

```typescript
export enum WebSocketEvents {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Tasks
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  TASK_ASSIGNED = 'task:assigned',
  TASK_STATUS_CHANGED = 'task:status_changed',
  
  // Teams
  TEAM_CREATED = 'team:created',
  TEAM_UPDATED = 'team:updated',
  TEAM_DELETED = 'team:deleted',
  TEAM_MEMBER_ADDED = 'team:member_added',
  TEAM_MEMBER_REMOVED = 'team:member_removed',
  
  // Notifications
  NOTIFICATION_NEW = 'notification:new',
  
  // Presence
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
}
```

## Integration

### App.tsx

The WebSocket connection is automatically initialized when the user logs in:

```tsx
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  useWebSocket(); // Auto-connects when authenticated
  
  // ... rest of app
}
```

### Store Updates

The stores (`taskStore`, `teamStore`) have WebSocket handler methods:

- `addTask(task)` - Add task from WebSocket
- `updateTaskFromWS(task)` - Update task from WebSocket
- `removeTask(taskId)` - Remove task from WebSocket

## Troubleshooting

### Connection Issues

1. **Check server is running**: Ensure the backend WebSocket server is running
2. **Check CORS**: Verify CORS is configured correctly
3. **Check JWT token**: Ensure the token is valid

### Events Not Received

1. **Check room membership**: User must be in the team room to receive events
2. **Check listener registration**: Ensure `useRealtimeTasks` or `useRealtimeTeams` is called
3. **Check cleanup**: Ensure listeners are cleaned up on unmount

### Memory Leaks

Always clean up listeners in useEffect:

```tsx
useEffect(() => {
  websocketService.on('event', handler);
  return () => websocketService.off('event', handler);
}, []);
```

## Best Practices

1. **Use hooks for subscriptions**: Always use the provided hooks instead of direct socket manipulation
2. **Clean up on unmount**: Always return cleanup function in useEffect
3. **Handle connection state**: Show appropriate UI for connecting/disconnected states
4. **Optimistic updates**: Update UI immediately, rollback on error
5. **Debounce rapid updates**: Prevent UI flooding with rapid changes
