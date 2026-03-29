import {
  Controller,
  Get,
  Query,
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
import { AnalyticsService } from "./analytics.service.js";
import { AnalyticsFilterDto } from "./dto/request/analytics-filter.dto.js";
import {
  DashboardOverviewDto,
  WeeklyTrendItemDto,
  StatusDistributionDto,
  PopularServiceDto,
  BarberPerformanceDto,
  ProfitLossDto,
  BarbershopAnalyticsDto,
} from "./dto/response/analytics-response.dto.js";
import { DataResponseDto } from "../common/dto/data-response.dto.js";
import { DataArrayResponseDto } from "../common/dto/data-response.dto.js";
import { ErrorResponseDto } from "../common/dto/status.dto.js";
import {
  ApiDataResponse,
  ApiDataArrayResponse,
} from "../common/decorators/response.decorator.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { JwtPayloadWithAuth } from "../common/entities/index.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Force barbershopId scope for BARBERSHOP_OWNER.
   * Owners can only see their own shop's data; admins can see all or filter freely.
   */
  private enforceTenantScope(
    filter: AnalyticsFilterDto,
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

  @Get("overview")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiDataResponse(DashboardOverviewDto)
  @ApiOperation({ summary: "Get dashboard overview metrics" })
  async getOverview(
    @Query() filter: AnalyticsFilterDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<DashboardOverviewDto>> {
    this.enforceTenantScope(filter, user);
    const overview = await this.analyticsService.getDashboardOverview(filter);
    return new DataResponseDto(overview);
  }

  @Get("weekly-trend")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiDataArrayResponse(WeeklyTrendItemDto)
  @ApiOperation({ summary: "Get 7-day booking trend" })
  async getWeeklyTrend(
    @Query() filter: AnalyticsFilterDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataArrayResponseDto<WeeklyTrendItemDto>> {
    this.enforceTenantScope(filter, user);
    const trend = await this.analyticsService.getWeeklyTrend(filter);
    return new DataArrayResponseDto(trend);
  }

  @Get("status-distribution")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiDataResponse(StatusDistributionDto)
  @ApiOperation({ summary: "Get booking status distribution" })
  async getStatusDistribution(
    @Query() filter: AnalyticsFilterDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<StatusDistributionDto>> {
    this.enforceTenantScope(filter, user);
    const distribution =
      await this.analyticsService.getStatusDistribution(filter);
    return new DataResponseDto(distribution);
  }

  @Get("popular-services")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiDataArrayResponse(PopularServiceDto)
  @ApiOperation({ summary: "Get top 5 popular services" })
  async getPopularServices(
    @Query() filter: AnalyticsFilterDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataArrayResponseDto<PopularServiceDto>> {
    this.enforceTenantScope(filter, user);
    const services = await this.analyticsService.getPopularServices(filter);
    return new DataArrayResponseDto(services);
  }

  @Get("barber-performance")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiDataArrayResponse(BarberPerformanceDto)
  @ApiOperation({ summary: "Get barber performance metrics" })
  async getBarberPerformance(
    @Query() filter: AnalyticsFilterDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataArrayResponseDto<BarberPerformanceDto>> {
    this.enforceTenantScope(filter, user);
    const performance =
      await this.analyticsService.getBarberPerformance(filter);
    return new DataArrayResponseDto(performance);
  }

  @Get("profit-loss")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiDataResponse(ProfitLossDto)
  @ApiOperation({ summary: "Get profit & loss summary" })
  async getProfitLoss(
    @Query() filter: AnalyticsFilterDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<ProfitLossDto>> {
    this.enforceTenantScope(filter, user);
    const pnl = await this.analyticsService.getProfitLoss(filter);
    return new DataResponseDto(pnl);
  }

  @Get("barbershops")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiDataArrayResponse(BarbershopAnalyticsDto)
  @ApiOperation({ summary: "Get analytics for all barbershops (super admin)" })
  async getBarbershopAnalytics(): Promise<
    DataArrayResponseDto<BarbershopAnalyticsDto>
  > {
    const analytics = await this.analyticsService.getBarbershopAnalytics();
    return new DataArrayResponseDto(analytics);
  }
}
