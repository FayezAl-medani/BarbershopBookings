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
import { SALARY_SERVICE } from "./salary.service.interface.js";
import type { ISalaryService } from "./salary.service.interface.js";
import { BARBER_SERVICE } from "../barber/barber.service.interface.js";
import type { IBarberService } from "../barber/barber.service.interface.js";
import { SalaryCreateDto } from "./dto/request/salary-create.dto.js";
import { SalaryPatchDto } from "./dto/request/salary-patch.dto.js";
import { SalaryFilterDto } from "./dto/request/salary-filter.dto.js";
import { SalaryResponseDto } from "./dto/response/salary-response.dto.js";
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
import { SalaryMapper } from "./mappers/salary.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Salary")
@Controller("salary")
export class SalaryController {
  constructor(
    @Inject(SALARY_SERVICE)
    private readonly salaryService: ISalaryService,
    @Inject(BARBER_SERVICE)
    private readonly barberService: IBarberService,
    private readonly salaryMapper: SalaryMapper,
  ) {}

  /** Verify BARBERSHOP_OWNER owns the barber referenced by barberId */
  private async assertBarberOwnership(
    barberId: string,
    user: JwtPayloadWithAuth,
  ): Promise<void> {
    if (user.loggedInAs !== RoleName.BARBERSHOP_OWNER) return;
    const barber = await this.barberService.getById(barberId);
    if (barber.barbershopId !== user.barbershopId) {
      throw new ForbiddenException(
        "You can only manage salary records for barbers in your own barbershop",
      );
    }
  }

  private enforceTenantScope(
    filter: SalaryFilterDto,
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
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Get all salary records with pagination" })
  @ApiPaginatedResponse(SalaryResponseDto)
  @ApiSortingQuery(["amount", "periodStart", "createdAt", "isPaid"])
  async findAll(
    @Query() filter: SalaryFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(["amount", "periodStart", "createdAt", "isPaid"])
    sort: SortingParam | null,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<PagingDataResponseDto<SalaryResponseDto>> {
    this.enforceTenantScope(filter, user);
    const result = await this.salaryService.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const mappedData = result.data.map((entity) =>
      this.salaryMapper.entityToResponseDto(entity),
    );
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Get salary record by ID" })
  @ApiDataResponse(SalaryResponseDto)
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<SalaryResponseDto>> {
    const salary = await this.salaryService.getById(id);
    if (user.loggedInAs === RoleName.BARBERSHOP_OWNER) {
      await this.assertBarberOwnership(salary.barberId, user);
    }
    return new DataResponseDto(this.salaryMapper.entityToResponseDto(salary));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Create a new salary record" })
  @ApiCreatedDataResponse(SalaryResponseDto)
  async create(
    @Body() payload: SalaryCreateDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<SalaryResponseDto>> {
    await this.assertBarberOwnership(payload.barberId, user);
    const salary = await this.salaryService.create(payload);
    return new DataResponseDto(this.salaryMapper.entityToResponseDto(salary));
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Update salary record" })
  @ApiDataResponse(SalaryResponseDto)
  async update(
    @Param("id") id: string,
    @Body() payload: SalaryPatchDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<SalaryResponseDto>> {
    if (user.loggedInAs === RoleName.BARBERSHOP_OWNER) {
      const salary = await this.salaryService.getById(id);
      await this.assertBarberOwnership(salary.barberId, user);
    }
    const salary = await this.salaryService.update(id, payload);
    return new DataResponseDto(this.salaryMapper.entityToResponseDto(salary));
  }

  @Patch(":id/pay")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Mark salary as paid" })
  @ApiDataResponse(SalaryResponseDto)
  async markAsPaid(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<SalaryResponseDto>> {
    if (user.loggedInAs === RoleName.BARBERSHOP_OWNER) {
      const existing = await this.salaryService.getById(id);
      await this.assertBarberOwnership(existing.barberId, user);
    }
    const salary = await this.salaryService.markAsPaid(id);
    return new DataResponseDto(this.salaryMapper.entityToResponseDto(salary));
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Delete salary record" })
  async remove(@Param("id") id: string): Promise<MessageResponseDto> {
    return this.salaryService.remove(id);
  }
}
