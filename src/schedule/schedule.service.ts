import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { IScheduleService } from "./schedule.service.interface.js";
import { ScheduleRepository } from "./schedule.repository.js";
import { ScheduleMapper } from "./mappers/schedule.mapper.js";
import { ScheduleEntity } from "./entities/schedule.entity.js";
import { ScheduleCreateDto } from "./dto/request/schedule-create.dto.js";
import { ScheduleFilterDto } from "./dto/request/schedule-filter.dto.js";
import { SchedulePatchDto } from "./dto/request/schedule-patch.dto.js";
import {
  MessageResponseDto,
  SuccessResponseDto,
} from "../common/dto/status.dto.js";

@Injectable()
export class ScheduleService implements IScheduleService {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly scheduleMapper: ScheduleMapper,
    private readonly i18nService: I18nService,
  ) {}

  async create(payload: ScheduleCreateDto): Promise<ScheduleEntity> {
    if (payload.startTime >= payload.endTime) {
      throw new BadRequestException(
        this.i18nService.translate("errors.SCHEDULE.INVALID_TIME"),
      );
    }

    const existing = await this.scheduleRepository.findByBarberIdAndDay(
      payload.barberId,
      payload.dayOfWeek,
    );
    if (existing) {
      throw new ConflictException(
        this.i18nService.translate("errors.SCHEDULE.ALREADY_EXISTS"),
      );
    }

    const schedule = await this.scheduleRepository.create(payload);
    return this.scheduleMapper.modelToEntity(schedule);
  }

  async findAllByBarberId(barberId: string): Promise<ScheduleEntity[]> {
    const schedules = await this.scheduleRepository.findAllByBarberId(barberId);
    return schedules.map((s) => this.scheduleMapper.modelToEntity(s));
  }

  async findAll(filter: ScheduleFilterDto): Promise<ScheduleEntity[]> {
    const schedules = await this.scheduleRepository.findAll(filter);
    return schedules.map((s) => this.scheduleMapper.modelToEntity(s));
  }

  async getById(id: string): Promise<ScheduleEntity> {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException(
        this.i18nService.translate("errors.SCHEDULE.NOT_FOUND"),
      );
    }
    return this.scheduleMapper.modelToEntity(schedule);
  }

  async update(id: string, payload: SchedulePatchDto): Promise<ScheduleEntity> {
    const existing = await this.getById(id);

    const startTime = payload.startTime || existing.startTime;
    const endTime = payload.endTime || existing.endTime;
    if (startTime >= endTime) {
      throw new BadRequestException(
        this.i18nService.translate("errors.SCHEDULE.INVALID_TIME"),
      );
    }

    const updated = await this.scheduleRepository.updateById(id, payload);
    return this.scheduleMapper.modelToEntity(updated);
  }

  async remove(id: string): Promise<MessageResponseDto> {
    await this.getById(id);
    await this.scheduleRepository.deleteById(id);
    return new SuccessResponseDto(
      this.i18nService.translate("messages.SCHEDULE.DELETED"),
    );
  }
}
