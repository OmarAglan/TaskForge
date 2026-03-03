import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMember } from '../teams/entities/team-member.entity';
import { Task } from '../tasks/entities/task.entity';
import { WebSocketModule } from '../websocket/websocket.module';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLog, TeamMember, Task]),
    WebSocketModule,
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService], // Export for use in other modules
})
export class ActivityModule {}
