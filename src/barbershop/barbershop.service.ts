import { Injectable, NotFoundException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { IBarbershopService } from "./barbershop.service.interface.js";
import { BarbershopRepository } from "./barbershop.repository.js";
import { BarbershopMapper } from "./mappers/barbershop.mapper.js";
import { BarbershopEntity } from "./entities/barbershop.entity.js";
import { BarbershopCreateDto } from "./dto/request/barbershop-create.dto.js";
import { BarbershopFilterDto } from "./dto/request/barbershop-filter.dto.js";
import { BarbershopPatchDto } from "./dto/request/barbershop-patch.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import {
  MessageResponseDto,
  SuccessResponseDto,
} from "../common/dto/status.dto.js";

@Injectable()
export class BarbershopService implements IBarbershopService {
  constructor(
    private readonly barbershopRepository: BarbershopRepository,
    private readonly barbershopMapper: BarbershopMapper,
    private readonly i18nService: I18nService,
  ) {}

  async create(payload: BarbershopCreateDto): Promise<BarbershopEntity> {
    const barbershop = await this.barbershopRepository.create(payload);
    return this.barbershopMapper.modelToEntity(barbershop);
  }

  async findAllPaging(
    filter: BarbershopFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<BarbershopEntity>> {
    const result = await this.barbershopRepository.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const data = result.data.map((res) =>
      this.barbershopMapper.modelToEntity(res),
    );
    return new PagingDataResponseDto(data, result.meta);
  }

  async getById(id: string): Promise<BarbershopEntity> {
    const barbershop = await this.barbershopRepository.findById(id);
    if (!barbershop) {
      throw new NotFoundException(
        this.i18nService.translate("errors.BARBERSHOP.NOT_FOUND"),
      );
    }
    const avgRating = await this.barbershopRepository.getAverageRating(id);
    const entity = this.barbershopMapper.modelToEntity(barbershop);
    entity.avgRating = avgRating;
    return entity;
  }

  async update(
    id: string,
    payload: BarbershopPatchDto,
  ): Promise<BarbershopEntity> {
    await this.getById(id);
    const updated = await this.barbershopRepository.updateById(id, payload);
    return this.barbershopMapper.modelToEntity(updated);
  }

  async remove(id: string): Promise<MessageResponseDto> {
    await this.getById(id);
    await this.barbershopRepository.deleteById(id);
    return new SuccessResponseDto(
      this.i18nService.translate("messages.BARBERSHOP.DELETED"),
    );
  }
}
