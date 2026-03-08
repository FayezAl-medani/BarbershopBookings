import { Injectable } from '@nestjs/common';
import { Schedule } from '@prisma/client';
import { ScheduleEntity } from '../entities/schedule.entity.js';
import { ScheduleResponseDto } from '../dto/response/schedule-response.dto.js';

@Injectable()
export class ScheduleMapper {
  modelToEntity(model: Schedule): ScheduleEntity {
    return new ScheduleEntity({
      id: model.id,
      barberId: model.barberId,
      dayOfWeek: model.dayOfWeek,
      startTime: model.startTime,
      endTime: model.endTime,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: ScheduleEntity): ScheduleResponseDto {
    return {
      id: entity.id,
      barberId: entity.barberId,
      dayOfWeek: entity.dayOfWeek,
      startTime: entity.startTime,
      endTime: entity.endTime,
      isActive: entity.isActive,
    };
  }
}
