import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TeamMember } from '../teams/entities/team-member.entity';
import { WebSocketEvents } from './events/websocket-events.enum';
import { createWsAuthMiddleware } from './middleware/ws-auth.middleware';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  // Map userId → socketIds (multiple tabs/devices)
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
  ) {}

  afterInit(server: Server) {
    // Authenticate sockets at the transport layer
    // (middleware runs before `handleConnection`)
    try {
      // `use()` exists on both Server and Namespace in socket.io v4
      (server as any).use(
        createWsAuthMiddleware(this.jwtService, this.configService, this.userRepository),
      );
      this.logger.log('WebSocket gateway initialized (namespace=/events)');
    } catch (err) {
      this.logger.error('Failed to initialize WebSocket middleware', err as any);
    }
  }

  async handleConnection(client: Socket) {
    try {
      const userId = client.data?.userId as string | undefined;

      if (!userId) {
        this.logger.warn(`Socket connected without userId. Disconnecting: ${client.id}`);
        client.disconnect(true);
        return;
      }

      this.trackUserSocket(userId, client.id);

      // Join user room for direct targeting
      client.join(this.userRoom(userId));

      // Auto-join all teams rooms for this user
      const memberships = await this.teamMemberRepository.find({
        where: { userId },
        select: ['teamId'],
      });

      const teamIds = memberships.map((m) => m.teamId);

      for (const teamId of teamIds) {
        client.join(this.teamRoom(teamId));
      }

      // Presence (emit to teams only, not globally)
      for (const teamId of teamIds) {
        this.emitToTeam(teamId, WebSocketEvents.USER_ONLINE, {
          userId,
          at: new Date().toISOString(),
        });
      }

      // Optional: confirmation event to the connected client
      client.emit('authenticated', { userId, teamIds });

      this.logger.log(`Client connected: socket=${client.id} user=${userId}`);
    } catch (err) {
      this.logger.error(`Error during socket connection: ${client.id}`, err as any);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = client.data?.userId as string | undefined;

      if (userId) {
        this.untrackUserSocket(userId, client.id);

        // Only emit offline if no other sockets remain for this user
        if (!this.userSockets.get(userId)?.size) {
          const teamIds = [...client.rooms]
            .filter((r) => r.startsWith('team:'))
            .map((r) => r.replace('team:', ''));

          for (const teamId of teamIds) {
            this.emitToTeam(teamId, WebSocketEvents.USER_OFFLINE, {
              userId,
              at: new Date().toISOString(),
            });
          }
        }

        this.logger.log(`Client disconnected: socket=${client.id} user=${userId}`);
      } else {
        this.logger.log(`Client disconnected: socket=${client.id}`);
      }
    } catch (err) {
      this.logger.error(`Error during socket disconnect: ${client.id}`, err as any);
    }
  }

  // -----------------------------
  // Room Management (client-driven)
  // -----------------------------

  @SubscribeMessage(WebSocketEvents.JOIN_TEAM)
  async handleJoinTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { teamId: string },
  ) {
    const userId = client.data?.userId as string | undefined;
    const teamId = body?.teamId;

    if (!userId || !teamId) {
      return { success: false, message: 'Missing userId/teamId' };
    }

    const membership = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
      select: ['id'],
    });

    if (!membership) {
      return { success: false, message: 'Forbidden: not a team member' };
    }

    client.join(this.teamRoom(teamId));
    return { success: true };
  }

  @SubscribeMessage(WebSocketEvents.LEAVE_TEAM)
  async handleLeaveTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { teamId: string },
  ) {
    const teamId = body?.teamId;

    if (!teamId) {
      return { success: false, message: 'Missing teamId' };
    }

    client.leave(this.teamRoom(teamId));
    return { success: true };
  }

  // -----------------------------
  // Room Management (server-driven)
  // -----------------------------

  joinTeamRoom(userId: string, teamId: string) {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds?.size) return;

    for (const socketId of socketIds) {
      this.server.to(socketId).socketsJoin?.(this.teamRoom(teamId));
      const socket = this.getSocketById(socketId);
      socket?.join(this.teamRoom(teamId));
    }
  }

  leaveTeamRoom(userId: string, teamId: string) {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds?.size) return;

    for (const socketId of socketIds) {
      this.server.to(socketId).socketsLeave?.(this.teamRoom(teamId));
      const socket = this.getSocketById(socketId);
      socket?.leave(this.teamRoom(teamId));
    }
  }

  // -----------------------------
  // Emit helpers
  // -----------------------------

  emitToUser(
    userId: string,
    event: string,
    data: any,
    options?: { excludeSocketId?: string },
  ) {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds?.size) return;

    for (const socketId of socketIds) {
      if (options?.excludeSocketId && options.excludeSocketId === socketId) continue;
      this.server.to(socketId).emit(event, data);
    }
  }

  emitToTeam(
    teamId: string,
    event: string,
    data: any,
    options?: { excludeSocketId?: string },
  ) {
    const room = this.teamRoom(teamId);

    const toRoom = (this.server as any).to(room);

    if (options?.excludeSocketId && typeof toRoom?.except === 'function') {
      toRoom.except(options.excludeSocketId).emit(event, data);
      return;
    }

    toRoom.emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // -----------------------------
  // Internals
  // -----------------------------

  private trackUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  private untrackUserSocket(userId: string, socketId: string) {
    const set = this.userSockets.get(userId);
    if (!set) return;

    set.delete(socketId);
    if (set.size === 0) {
      this.userSockets.delete(userId);
    }
  }

  private getSocketById(socketId: string): Socket | undefined {
    const anyServer = this.server as any;

    // Namespace case: `namespace.sockets` is a Map
    const direct = anyServer?.sockets?.get?.(socketId) as Socket | undefined;
    if (direct) return direct;

    // Server case: `server.sockets.sockets` is a Map
    const nested = anyServer?.sockets?.sockets?.get?.(socketId) as Socket | undefined;
    if (nested) return nested;

    return undefined;
  }

  private teamRoom(teamId: string) {
    return `team:${teamId}`;
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }
}