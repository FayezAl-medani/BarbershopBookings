import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { ICommissionService } from "./commission.service.interface.js";
import { CommissionRepository } from "./commission.repository.js";
import { CommissionMapper } from "./mappers/commission.mapper.js";
import { CommissionEntity } from "./entities/commission.entity.js";
import { CommissionFilterDto } from "./dto/request/commission-filter.dto.js";
import { CommissionSummaryResponseDto } from "./dto/response/commission-summary-response.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import { BookingRepository } from "../booking/booking.repository.js";
import { BarberRepository } from "../barber/barber.repository.js";

@Injectable()
export class CommissionService implements ICommissionService {
  constructor(
    private readonly commissionRepository: CommissionRepository,
    private readonly commissionMapper: CommissionMapper,
    private readonly bookingRepository: BookingRepository,
    private readonly barberRepository: BarberRepository,
    private readonly i18nService: I18nService,
  ) {}

  async createFromBooking(bookingId: string): Promise<CommissionEntity> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(
        this.i18nService.translate("errors.BOOKING.NOT_FOUND"),
      );
    }

    const barber = await this.barberRepository.findById(booking.barberId);
    if (!barber || !barber.commissionRate) {
      throw new BadRequestException(
        this.i18nService.translate("errors.COMMISSION.NO_COMMISSION_RATE"),
      );
    }

    const amount = Number(booking.totalPrice) * Number(barber.commissionRate);

    const commission = await this.commissionRepository.create({
      barberId: booking.barberId,
      bookingId,
      amount,
      commissionRate: Number(barber.commissionRate),
      status: "PENDING",
    });

    return this.commissionMapper.modelToEntity(commission);
  }

  async findAllPaging(
    filter: CommissionFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<CommissionEntity>> {
    const result = await this.commissionRepository.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const data = result.data.map((res) =>
      this.commissionMapper.modelToEntity(res),
    );
    return new PagingDataResponseDto(data, result.meta);
  }

  async getById(id: string): Promise<CommissionEntity> {
    const commission = await this.commissionRepository.findById(id);
    if (!commission) {
      throw new NotFoundException(
        this.i18nService.translate("errors.COMMISSION.NOT_FOUND"),
      );
    }
    return this.commissionMapper.modelToEntity(commission);
  }

  async collect(id: string, collectedById: string): Promise<CommissionEntity> {
    const commission = await this.commissionRepository.findById(id);
    if (!commission) {
      throw new NotFoundException(
        this.i18nService.translate("errors.COMMISSION.NOT_FOUND"),
      );
    }

    if (commission.status === "COLLECTED") {
      throw new BadRequestException(
        this.i18nService.translate("errors.COMMISSION.ALREADY_COLLECTED"),
      );
    }

    const updated = await this.commissionRepository.updateById(id, {
      status: "COLLECTED",
      collectedAt: new Date(),
      collectedById,
    });

    return this.commissionMapper.modelToEntity(updated);
  }

  async getSummary(): Promise<CommissionSummaryResponseDto> {
    return this.commissionRepository.getSummary();
  }
}
