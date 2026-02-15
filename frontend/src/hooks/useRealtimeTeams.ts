import { useCallback, useEffect } from 'react';
import { websocketService } from '../services/websocket/websocket.service';
import { useTeamStore } from '../store/teamStore';
import type { TeamMember } from '../types/team.types';
import { WebSocketEvents, type TeamEventPayload } from '../types/websocket.types';
import { toast } from '../utils/toast';

/**
 * Hook for handling real-time team updates via WebSocket
 * This hook manages WebSocket subscriptions for team events and updates the team store
 */
export function useRealtimeTeams() {
    const {
        currentTeam,
        addTeam,
        updateTeamFromWS,
        removeTeam,
        addMemberFromWS,
        removeMemberFromWS,
        updateMemberFromWS,
    } = useTeamStore();

    const handleTeamCreated = useCallback(
        (payload: TeamEventPayload) => {
            addTeam(payload.team);
        },
        [addTeam],
    );

    const handleTeamUpdated = useCallback(
        (payload: TeamEventPayload) => {
            updateTeamFromWS(payload.team);
        },
        [updateTeamFromWS],
    );

    const handleTeamDeleted = useCallback(
        (payload: { teamId: string }) => {
            removeTeam(payload.teamId);
            toast.info('A team was deleted');
        },
        [removeTeam],
    );

    const handleMemberAdded = useCallback(
        (payload: TeamEventPayload) => {
            if (payload.teamId === currentTeam?.id) {
                const member: TeamMember = {
                    id: payload.memberId || '',
                    userId: payload.memberId || '',
                    teamId: payload.teamId,
                    role: payload.memberRole as any,
                    user: undefined,
                    joinedAt: new Date().toISOString(),
                };
                addMemberFromWS(payload.teamId, member);
            }
            toast.info(`New member added to team: ${payload.team.name}`);
        },
        [currentTeam, addMemberFromWS],
    );

    const handleMemberRemoved = useCallback(
        (payload: TeamEventPayload) => {
            if (payload.teamId === currentTeam?.id && payload.memberId) {
                removeMemberFromWS(payload.teamId, payload.memberId);
            }
        },
        [currentTeam, removeMemberFromWS],
    );

    const handleMemberRoleChanged = useCallback(
        (payload: TeamEventPayload) => {
            if (payload.teamId === currentTeam?.id && payload.memberId) {
                const member: TeamMember = {
                    id: payload.memberId,
                    userId: payload.memberId,
                    teamId: payload.teamId,
                    role: payload.memberRole as any,
                    user: undefined,
                    joinedAt: new Date().toISOString(),
                };
                updateMemberFromWS(payload.teamId, member);
            }
            toast.info('Team member role updated');
        },
        [currentTeam, updateMemberFromWS],
    );

    useEffect(() => {
        // Register event listeners
        websocketService.on(WebSocketEvents.TEAM_CREATED, handleTeamCreated);
        websocketService.on(WebSocketEvents.TEAM_UPDATED, handleTeamUpdated);
        websocketService.on(WebSocketEvents.TEAM_DELETED, handleTeamDeleted);
        websocketService.on(WebSocketEvents.TEAM_MEMBER_ADDED, handleMemberAdded);
        websocketService.on(WebSocketEvents.TEAM_MEMBER_REMOVED, handleMemberRemoved);
        websocketService.on(WebSocketEvents.TEAM_MEMBER_ROLE_CHANGED, handleMemberRoleChanged);

        // Cleanup on unmount
        return () => {
            websocketService.off(WebSocketEvents.TEAM_CREATED, handleTeamCreated);
            websocketService.off(WebSocketEvents.TEAM_UPDATED, handleTeamUpdated);
            websocketService.off(WebSocketEvents.TEAM_DELETED, handleTeamDeleted);
            websocketService.off(WebSocketEvents.TEAM_MEMBER_ADDED, handleMemberAdded);
            websocketService.off(WebSocketEvents.TEAM_MEMBER_REMOVED, handleMemberRemoved);
            websocketService.off(WebSocketEvents.TEAM_MEMBER_ROLE_CHANGED, handleMemberRoleChanged);
        };
    }, [
        handleTeamCreated,
        handleTeamUpdated,
        handleTeamDeleted,
        handleMemberAdded,
        handleMemberRemoved,
        handleMemberRoleChanged,
        currentTeam,
    ]);
}
