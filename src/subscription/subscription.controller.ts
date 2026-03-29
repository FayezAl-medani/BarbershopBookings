import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { SUBSCRIPTION_SERVICE } from "./subscription.service.interface.js";
import type { ISubscriptionService } from "./subscription.service.interface.js";
import { SubscriptionCreateDto } from "./dto/request/subscription-create.dto.js";
import { SubscriptionPatchDto } from "./dto/request/subscription-patch.dto.js";
import { SubscriptionFilterDto } from "./dto/request/subscription-filter.dto.js";
import { SubscriptionResponseDto } from "./dto/response/subscription-response.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { DataResponseDto } from "../common/dto/data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import {
  ErrorResponseDto,
  MessageResponseDto,
} from "../common/dto/status.dto.js";
import {
  SortingParams,
  SortingParam,
} from "../common/decorators/sorting-params.decorator.js";
import { ApiSortingQuery } from "../common/decorators/sorting-params-swagger.decorator.js";
import {
  ApiDataResponse,
  ApiPaginatedResponse,
  ApiCreatedDataResponse,
  ApiMessageResponse,
} from "../common/decorators/response.decorator.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { JwtPayloadWithAuth } from "../common/entities/index.js";
import { SubscriptionMapper } from "./mappers/subscription.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Subscription")
@Controller("subscription")
export class SubscriptionController {
  constructor(
    @Inject(SUBSCRIPTION_SERVICE)
    private readonly subscriptionService: ISubscriptionService,
    private readonly subscriptionMapper: SubscriptionMapper,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Get all subscriptions with pagination" })
  @ApiPaginatedResponse(SubscriptionResponseDto)
  @ApiSortingQuery(["amount", "startDate", "endDate", "status", "createdAt"])
  async findAll(
    @Query() filter: SubscriptionFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(["amount", "startDate", "endDate", "status", "createdAt"])
    sort: SortingParam | null,
  ): Promise<PagingDataResponseDto<SubscriptionResponseDto>> {
    const result = await this.subscriptionService.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const mappedData = result.data.map((entity) =>
      this.subscriptionMapper.entityToResponseDto(entity),
    );
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Get subscription by ID" })
  @ApiDataResponse(SubscriptionResponseDto)
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<SubscriptionResponseDto>> {
    const subscription = await this.subscriptionService.getById(id);
    if (
      user.loggedInAs === RoleName.BARBERSHOP_OWNER &&
      subscription.barbershopId !== user.barbershopId
    ) {
      throw new ForbiddenException(
        "You can only view subscriptions for your own barbershop",
      );
    }
    return new DataResponseDto(
      this.subscriptionMapper.entityToResponseDto(subscription),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Create a new subscription for a barbershop" })
  @ApiCreatedDataResponse(SubscriptionResponseDto)
  async create(
    @Body() payload: SubscriptionCreateDto,
  ): Promise<DataResponseDto<SubscriptionResponseDto>> {
    const subscription = await this.subscriptionService.create(payload);
    return new DataResponseDto(
      this.subscriptionMapper.entityToResponseDto(subscription),
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Update subscription" })
  @ApiDataResponse(SubscriptionResponseDto)
  async update(
    @Param("id") id: string,
    @Body() payload: SubscriptionPatchDto,
  ): Promise<DataResponseDto<SubscriptionResponseDto>> {
    const subscription = await this.subscriptionService.update(id, payload);
    return new DataResponseDto(
      this.subscriptionMapper.entityToResponseDto(subscription),
    );
  }

  @Patch(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Cancel a subscription" })
  @ApiDataResponse(SubscriptionResponseDto)
  async cancel(
    @Param("id") id: string,
  ): Promise<DataResponseDto<SubscriptionResponseDto>> {
    const subscription = await this.subscriptionService.cancel(id);
    return new DataResponseDto(
      this.subscriptionMapper.entityToResponseDto(subscription),
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Delete subscription" })
  async remove(@Param("id") id: string): Promise<MessageResponseDto> {
    return this.subscriptionService.remove(id);
  }
}
