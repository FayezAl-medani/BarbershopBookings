import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { ISubscriptionService } from "./subscription.service.interface.js";
import { SubscriptionRepository } from "./subscription.repository.js";
import { SubscriptionMapper } from "./mappers/subscription.mapper.js";
import { SubscriptionEntity } from "./entities/subscription.entity.js";
import { SubscriptionCreateDto } from "./dto/request/subscription-create.dto.js";
import { SubscriptionPatchDto } from "./dto/request/subscription-patch.dto.js";
import { SubscriptionFilterDto } from "./dto/request/subscription-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import {
  MessageResponseDto,
  SuccessResponseDto,
} from "../common/dto/status.dto.js";

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionMapper: SubscriptionMapper,
    private readonly i18nService: I18nService,
  ) {}

  async create(payload: SubscriptionCreateDto): Promise<SubscriptionEntity> {
    if (new Date(payload.endDate) <= new Date(payload.startDate)) {
      throw new BadRequestException("End date must be after start date");
    }

    // Check for existing active subscription
    const existing = await this.subscriptionRepository.findActiveByBarbershopId(
      payload.barbershopId,
    );
    if (existing) {
      throw new BadRequestException(
        "Barbershop already has an active subscription",
      );
    }

    const subscription = await this.subscriptionRepository.create({
      barbershopId: payload.barbershopId,
      planName: payload.planName,
      amount: payload.amount,
      currency: payload.currency || "SAR",
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      autoRenew: payload.autoRenew ?? true,
      notes: payload.notes,
    });

    return this.subscriptionMapper.modelToEntity(subscription);
  }

  async findAllPaging(
    filter: SubscriptionFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<SubscriptionEntity>> {
    const result = await this.subscriptionRepository.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const data = result.data.map((res) =>
      this.subscriptionMapper.modelToEntity(res),
    );
    return new PagingDataResponseDto(data, result.meta);
  }

  async getById(id: string): Promise<SubscriptionEntity> {
    const subscription = await this.subscriptionRepository.findById(id);
    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }
    return this.subscriptionMapper.modelToEntity(subscription);
  }

  async update(
    id: string,
    payload: SubscriptionPatchDto,
  ): Promise<SubscriptionEntity> {
    await this.getById(id);

    const updateData: any = { ...payload };
    if (payload.endDate) updateData.endDate = new Date(payload.endDate);

    const updated = await this.subscriptionRepository.updateById(
      id,
      updateData,
    );
    return this.subscriptionMapper.modelToEntity(updated);
  }

  async cancel(id: string): Promise<SubscriptionEntity> {
    const subscription = await this.getById(id);
    if (subscription.status === "CANCELLED") {
      throw new BadRequestException("Subscription is already cancelled");
    }

    const updated = await this.subscriptionRepository.updateById(id, {
      status: "CANCELLED",
      autoRenew: false,
    });
    return this.subscriptionMapper.modelToEntity(updated);
  }

  async remove(id: string): Promise<MessageResponseDto> {
    await this.getById(id);
    await this.subscriptionRepository.deleteById(id);
    return new SuccessResponseDto("Subscription deleted successfully");
  }
}
