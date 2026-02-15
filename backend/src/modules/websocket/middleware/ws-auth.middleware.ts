import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export interface WsAuthPayload {
  sub: string;
  email?: string;
  role?: string;
}

function extractTokenFromSocket(client: Socket): string | null {
  const authToken = client.handshake.auth?.token;
  if (typeof authToken === 'string' && authToken.trim().length > 0) {
    return authToken.trim();
  }

  const queryToken = client.handshake.query?.token;
  if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
    return queryToken.trim();
  }

  const headerAuth = client.handshake.headers?.authorization;
  if (typeof headerAuth === 'string' && headerAuth.trim().length > 0) {
    const trimmed = headerAuth.trim();
    if (trimmed.toLowerCase().startsWith('bearer ')) {
      return trimmed.slice('bearer '.length).trim();
    }
    return trimmed;
  }

  return null;
}

/**
 * Socket.io middleware factory for authenticating WebSocket clients using JWT.
 *
 * - Extracts token from: `handshake.auth.token`, `handshake.query.token`, or `Authorization` header
 * - Verifies JWT signature/expiry
 * - Loads user from DB and attaches to `socket.data.user`
 */
export function createWsAuthMiddleware(
  jwtService: JwtService,
  configService: ConfigService,
  userRepository: Repository<User>,
) {
  return async (client: Socket, next: (err?: Error) => void) => {
    try {
      const token = extractTokenFromSocket(client);

      if (!token) {
        return next(new Error('Unauthorized: missing token'));
      }

      const payload = (await jwtService.verifyAsync(token, {
        secret: configService.get<string>('jwt.secret'),
      })) as WsAuthPayload;

      if (!payload?.sub) {
        return next(new Error('Unauthorized: invalid token payload'));
      }

      const user = await userRepository.findOne({ where: { id: payload.sub } });

      if (!user) {
        return next(new Error('Unauthorized: user not found'));
      }

      client.data.user = user;
      client.data.userId = user.id;

      return next();
    } catch (err: any) {
      return next(new Error('Unauthorized: invalid or expired token'));
    }
  };
}