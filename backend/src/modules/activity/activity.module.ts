import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLog]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService], // Export for use in other modules
})
export class ActivityModule {}