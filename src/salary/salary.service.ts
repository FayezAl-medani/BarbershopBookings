import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { ISalaryService } from "./salary.service.interface.js";
import { SalaryRepository } from "./salary.repository.js";
import { SalaryMapper } from "./mappers/salary.mapper.js";
import { SalaryEntity } from "./entities/salary.entity.js";
import { SalaryCreateDto } from "./dto/request/salary-create.dto.js";
import { SalaryPatchDto } from "./dto/request/salary-patch.dto.js";
import { SalaryFilterDto } from "./dto/request/salary-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import {
  MessageResponseDto,
  SuccessResponseDto,
} from "../common/dto/status.dto.js";

@Injectable()
export class SalaryService implements ISalaryService {
  constructor(
    private readonly salaryRepository: SalaryRepository,
    private readonly salaryMapper: SalaryMapper,
    private readonly i18nService: I18nService,
  ) {}

  async create(payload: SalaryCreateDto): Promise<SalaryEntity> {
    if (new Date(payload.periodEnd) <= new Date(payload.periodStart)) {
      throw new BadRequestException("Period end must be after period start");
    }

    const salary = await this.salaryRepository.create({
      barberId: payload.barberId,
      type: payload.type,
      amount: payload.amount,
      currency: payload.currency || "SAR",
      periodStart: new Date(payload.periodStart),
      periodEnd: new Date(payload.periodEnd),
      notes: payload.notes,
    });

    return this.salaryMapper.modelToEntity(salary);
  }

  async findAllPaging(
    filter: SalaryFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<SalaryEntity>> {
    const result = await this.salaryRepository.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const data = result.data.map((res) => this.salaryMapper.modelToEntity(res));
    return new PagingDataResponseDto(data, result.meta);
  }

  async getById(id: string): Promise<SalaryEntity> {
    const salary = await this.salaryRepository.findById(id);
    if (!salary) {
      throw new NotFoundException("Salary record not found");
    }
    return this.salaryMapper.modelToEntity(salary);
  }

  async update(id: string, payload: SalaryPatchDto): Promise<SalaryEntity> {
    await this.getById(id);

    const updateData: any = { ...payload };
    if (payload.periodStart)
      updateData.periodStart = new Date(payload.periodStart);
    if (payload.periodEnd) updateData.periodEnd = new Date(payload.periodEnd);
    if (payload.isPaid) updateData.paidAt = new Date();

    const updated = await this.salaryRepository.updateById(id, updateData);
    return this.salaryMapper.modelToEntity(updated);
  }

  async markAsPaid(id: string): Promise<SalaryEntity> {
    const salary = await this.getById(id);
    if (salary.isPaid) {
      throw new BadRequestException("Salary is already marked as paid");
    }

    const updated = await this.salaryRepository.updateById(id, {
      isPaid: true,
      paidAt: new Date(),
    });
    return this.salaryMapper.modelToEntity(updated);
  }

  async remove(id: string): Promise<MessageResponseDto> {
    await this.getById(id);
    await this.salaryRepository.deleteById(id);
    return new SuccessResponseDto("Salary record deleted successfully");
  }
}
