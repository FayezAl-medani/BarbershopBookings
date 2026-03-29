import { SubscriptionEntity } from "./entities/subscription.entity.js";
import { SubscriptionCreateDto } from "./dto/request/subscription-create.dto.js";
import { SubscriptionPatchDto } from "./dto/request/subscription-patch.dto.js";
import { SubscriptionFilterDto } from "./dto/request/subscription-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { MessageResponseDto } from "../common/dto/status.dto.js";

export const SUBSCRIPTION_SERVICE = "ISubscriptionService";

export interface ISubscriptionService {
  create(payload: SubscriptionCreateDto): Promise<SubscriptionEntity>;
  findAllPaging(
    filter: SubscriptionFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<SubscriptionEntity>>;
  getById(id: string): Promise<SubscriptionEntity>;
  update(
    id: string,
    payload: SubscriptionPatchDto,
  ): Promise<SubscriptionEntity>;
  cancel(id: string): Promise<SubscriptionEntity>;
  remove(id: string): Promise<MessageResponseDto>;
}
