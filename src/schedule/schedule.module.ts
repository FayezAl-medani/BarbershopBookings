import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller.js';
import { ScheduleService } from './schedule.service.js';
import { ScheduleRepository } from './schedule.repository.js';
import { ScheduleMapper } from './mappers/schedule.mapper.js';
import { SCHEDULE_SERVICE } from './schedule.service.interface.js';

@Module({
  controllers: [ScheduleController],
  providers: [
    ScheduleRepository,
    ScheduleMapper,
    {
      provide: SCHEDULE_SERVICE,
      useClass: ScheduleService,
    },
  ],
  exports: [SCHEDULE_SERVICE, ScheduleRepository, ScheduleMapper],
})
export class ScheduleModule {}
