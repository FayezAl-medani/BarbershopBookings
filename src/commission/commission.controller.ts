import {
  Controller,
  Get,
  Patch,
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
import { COMMISSION_SERVICE } from "./commission.service.interface.js";
import type { ICommissionService } from "./commission.service.interface.js";
import { CommissionFilterDto } from "./dto/request/commission-filter.dto.js";
import { CommissionResponseDto } from "./dto/response/commission-response.dto.js";
import { CommissionSummaryResponseDto } from "./dto/response/commission-summary-response.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { DataResponseDto } from "../common/dto/data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import { ErrorResponseDto } from "../common/dto/status.dto.js";
import {
  SortingParams,
  SortingParam,
} from "../common/decorators/sorting-params.decorator.js";
import { ApiSortingQuery } from "../common/decorators/sorting-params-swagger.decorator.js";
import {
  ApiDataResponse,
  ApiPaginatedResponse,
} from "../common/decorators/response.decorator.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { JwtPayloadWithAuth } from "../common/entities/index.js";
import { CommissionMapper } from "./mappers/commission.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Commission")
@Controller("commission")
export class CommissionController {
  constructor(
    @Inject(COMMISSION_SERVICE)
    private readonly commissionService: ICommissionService,
    private readonly commissionMapper: CommissionMapper,
  ) {}

  private enforceTenantScope(
    filter: CommissionFilterDto,
    user: JwtPayloadWithAuth,
  ): void {
    if (user.loggedInAs === RoleName.BARBERSHOP_OWNER) {
      if (!user.barbershopId) {
        throw new ForbiddenException(
          "No barbershop associated with this account",
        );
      }
      filter.barbershopId = user.barbershopId;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Get all commissions with pagination" })
  @ApiPaginatedResponse(CommissionResponseDto)
  @ApiSortingQuery(["amount", "createdAt", "status"])
  async findAll(
    @Query() filter: CommissionFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(["amount", "createdAt", "status"]) sort: SortingParam | null,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<PagingDataResponseDto<CommissionResponseDto>> {
    this.enforceTenantScope(filter, user);
    const result = await this.commissionService.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const mappedData = result.data.map((entity) =>
      this.commissionMapper.entityToResponseDto(entity),
    );
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get("summary")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Get commission summary report" })
  @ApiDataResponse(CommissionSummaryResponseDto)
  async getSummary(): Promise<DataResponseDto<CommissionSummaryResponseDto>> {
    const summary = await this.commissionService.getSummary();
    return new DataResponseDto(summary);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Get commission by ID" })
  @ApiDataResponse(CommissionResponseDto)
  async findOne(
    @Param("id") id: string,
  ): Promise<DataResponseDto<CommissionResponseDto>> {
    const commission = await this.commissionService.getById(id);
    return new DataResponseDto(
      this.commissionMapper.entityToResponseDto(commission),
    );
  }

  @Patch(":id/collect")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Mark commission as collected" })
  @ApiDataResponse(CommissionResponseDto)
  async collect(
    @Param("id") id: string,
    @CurrentUser("userId") userId: string,
  ): Promise<DataResponseDto<CommissionResponseDto>> {
    const commission = await this.commissionService.collect(id, userId);
    return new DataResponseDto(
      this.commissionMapper.entityToResponseDto(commission),
    );
  }
}
