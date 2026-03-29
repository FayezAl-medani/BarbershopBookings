import { Injectable, NotFoundException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { IBarberService } from "./barber.service.interface.js";
import { BarberRepository } from "./barber.repository.js";
import { BarberMapper } from "./mappers/barber.mapper.js";
import { BarberEntity } from "./entities/barber.entity.js";
import { BarberCreateDto } from "./dto/request/barber-create.dto.js";
import { BarberFilterDto } from "./dto/request/barber-filter.dto.js";
import { BarberPatchDto } from "./dto/request/barber-patch.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import {
  MessageResponseDto,
  SuccessResponseDto,
} from "../common/dto/status.dto.js";

@Injectable()
export class BarberService implements IBarberService {
  constructor(
    private readonly barberRepository: BarberRepository,
    private readonly barberMapper: BarberMapper,
    private readonly i18nService: I18nService,
  ) {}

  async create(payload: BarberCreateDto): Promise<BarberEntity> {
    const barber = await this.barberRepository.create(payload);
    return this.barberMapper.modelToEntity(barber);
  }

  async findAllPaging(
    filter: BarberFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<BarberEntity>> {
    const result = await this.barberRepository.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const data = result.data.map((res) => this.barberMapper.modelToEntity(res));
    return new PagingDataResponseDto(data, result.meta);
  }

  async getById(id: string): Promise<BarberEntity> {
    const barber = await this.barberRepository.findById(id);
    if (!barber) {
      throw new NotFoundException(
        this.i18nService.translate("errors.BARBER.NOT_FOUND"),
      );
    }
    return this.barberMapper.modelToEntity(barber);
  }

  async getByUserId(userId: string): Promise<BarberEntity> {
    const barber = await this.barberRepository.findByUserId(userId);
    if (!barber) {
      throw new NotFoundException(
        this.i18nService.translate("errors.BARBER.NOT_FOUND"),
      );
    }
    return this.barberMapper.modelToEntity(barber);
  }

  async update(id: string, payload: BarberPatchDto): Promise<BarberEntity> {
    await this.getById(id);
    const updated = await this.barberRepository.updateById(id, payload);
    return this.barberMapper.modelToEntity(updated);
  }

  async remove(id: string): Promise<MessageResponseDto> {
    await this.getById(id);
    await this.barberRepository.deleteById(id);
    return new SuccessResponseDto(
      this.i18nService.translate("messages.BARBER.DELETED"),
    );
  }
}
