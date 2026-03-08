import { ScheduleEntity } from './entities/schedule.entity.js';
import { ScheduleCreateDto } from './dto/request/schedule-create.dto.js';
import { ScheduleFilterDto } from './dto/request/schedule-filter.dto.js';
import { SchedulePatchDto } from './dto/request/schedule-patch.dto.js';
import { MessageResponseDto } from '../common/dto/status.dto.js';

export const SCHEDULE_SERVICE = 'IScheduleService';

export interface IScheduleService {
  create(payload: ScheduleCreateDto): Promise<ScheduleEntity>;
  findAllByBarberId(barberId: string): Promise<ScheduleEntity[]>;
  findAll(filter: ScheduleFilterDto): Promise<ScheduleEntity[]>;
  getById(id: string): Promise<ScheduleEntity>;
  update(id: string, payload: SchedulePatchDto): Promise<ScheduleEntity>;
  remove(id: string): Promise<MessageResponseDto>;
}
