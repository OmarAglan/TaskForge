import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController, TeamTasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { TeamsModule } from '../teams/teams.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    TeamsModule,
    UsersModule,
  ],
  controllers: [TasksController, TeamTasksController],
  providers: [TasksService],
  exports: [TasksService, TypeOrmModule],
})
export class TasksModule {}