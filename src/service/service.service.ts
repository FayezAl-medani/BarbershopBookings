import { Injectable, NotFoundException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { IServiceService } from "./service.service.interface.js";
import { ServiceRepository } from "./service.repository.js";
import { ServiceMapper } from "./mappers/service.mapper.js";
import { ServiceEntity } from "./entities/service.entity.js";
import { ServiceCreateDto } from "./dto/request/service-create.dto.js";
import { ServiceFilterDto } from "./dto/request/service-filter.dto.js";
import { ServicePatchDto } from "./dto/request/service-patch.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import {
  MessageResponseDto,
  SuccessResponseDto,
} from "../common/dto/status.dto.js";

@Injectable()
export class ServiceService implements IServiceService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly serviceMapper: ServiceMapper,
    private readonly i18nService: I18nService,
  ) {}

  async create(payload: ServiceCreateDto): Promise<ServiceEntity> {
    const service = await this.serviceRepository.create(payload);
    return this.serviceMapper.modelToEntity(service);
  }

  async findAllPaging(
    filter: ServiceFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<ServiceEntity>> {
    const result = await this.serviceRepository.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const data = result.data.map((res) =>
      this.serviceMapper.modelToEntity(res),
    );
    return new PagingDataResponseDto(data, result.meta);
  }

  async getById(id: string): Promise<ServiceEntity> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(
        this.i18nService.translate("errors.SERVICE.NOT_FOUND"),
      );
    }
    return this.serviceMapper.modelToEntity(service);
  }

  async update(id: string, payload: ServicePatchDto): Promise<ServiceEntity> {
    await this.getById(id);
    const updated = await this.serviceRepository.updateById(id, payload);
    return this.serviceMapper.modelToEntity(updated);
  }

  async remove(id: string): Promise<MessageResponseDto> {
    await this.getById(id);
    await this.serviceRepository.deleteById(id);
    return new SuccessResponseDto(
      this.i18nService.translate("messages.SERVICE.DELETED"),
    );
  }
}
