import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { TeamMember } from '../teams/entities/team-member.entity';
import { EventsGateway } from './events.gateway';
import { WebSocketService } from './websocket.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, TeamMember]),

    // Provide JwtService + verify/sign config for WS auth middleware
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EventsGateway, WebSocketService],
  exports: [WebSocketService],
})
export class WebSocketModule {}