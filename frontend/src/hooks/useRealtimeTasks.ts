import { useCallback, useEffect } from 'react';
import { normalizeTask } from '../api/tasks.api';
import type { BackendTask } from '../api/tasks.api';
import { websocketService } from '../services/websocket/websocket.service';
import { useTaskStore } from '../store/taskStore';
import { WebSocketEvents, type TaskEventPayload } from '../types/websocket.types';
import { toast } from '../utils/toast';

/**
 * Hook for handling real-time task updates via WebSocket
 * This hook manages WebSocket subscriptions for task events and updates the task store
 */
export function useRealtimeTasks(teamId?: string) {
    const { addTask, updateTaskFromWS, removeTask } = useTaskStore();

    const handleTaskCreated = useCallback(
        (payload: TaskEventPayload) => {
            // Don't add if we already have it (could be from our own optimistic update)
            const normalizedTask = normalizeTask(payload.task as BackendTask);
            addTask(normalizedTask);
            toast.success(`New task created: ${normalizedTask.title}`);
        },
        [addTask],
    );

    const handleTaskUpdated = useCallback(
        (payload: TaskEventPayload) => {
            updateTaskFromWS(normalizeTask(payload.task as BackendTask));
        },
        [updateTaskFromWS],
    );

    const handleTaskDeleted = useCallback(
        (payload: { taskId: string }) => {
            removeTask(payload.taskId);
        },
        [removeTask],
    );

    const handleTaskStatusChanged = useCallback(
        (payload: TaskEventPayload) => {
            const normalizedTask = normalizeTask(payload.task as BackendTask);
            updateTaskFromWS(normalizedTask);
            toast.info(`Task "${normalizedTask.title}" status changed to ${payload.newStatus}`);
        },
        [updateTaskFromWS],
    );

    const handleTaskAssigned = useCallback(
        (payload: TaskEventPayload) => {
            updateTaskFromWS(normalizeTask(payload.task as BackendTask));
            // Show notification only if assigned to current user (handled by useNotifications)
        },
        [updateTaskFromWS],
    );

    useEffect(() => {
        // Join team room if teamId provided
        if (teamId) {
            websocketService.joinTeam(teamId);
        }

        // Register event listeners
        websocketService.on(WebSocketEvents.TASK_CREATED, handleTaskCreated);
        websocketService.on(WebSocketEvents.TASK_UPDATED, handleTaskUpdated);
        websocketService.on(WebSocketEvents.TASK_DELETED, handleTaskDeleted);
        websocketService.on(WebSocketEvents.TASK_STATUS_CHANGED, handleTaskStatusChanged);
        websocketService.on(WebSocketEvents.TASK_ASSIGNED, handleTaskAssigned);

        // Cleanup on unmount
        return () => {
            // Leave team room if teamId was provided
            if (teamId) {
                websocketService.leaveTeam(teamId);
            }

            // Remove event listeners
            websocketService.off(WebSocketEvents.TASK_CREATED, handleTaskCreated);
            websocketService.off(WebSocketEvents.TASK_UPDATED, handleTaskUpdated);
            websocketService.off(WebSocketEvents.TASK_DELETED, handleTaskDeleted);
            websocketService.off(WebSocketEvents.TASK_STATUS_CHANGED, handleTaskStatusChanged);
            websocketService.off(WebSocketEvents.TASK_ASSIGNED, handleTaskAssigned);
        };
    }, [
        teamId,
        handleTaskCreated,
        handleTaskUpdated,
        handleTaskDeleted,
        handleTaskStatusChanged,
        handleTaskAssigned,
    ]);
}
