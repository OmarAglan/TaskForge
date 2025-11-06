import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, TeamMember]),
    UsersModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService, TypeOrmModule],
})
export class TeamsModule {}