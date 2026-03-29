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
import { SERVICE_SERVICE } from "./service.service.interface.js";
import type { IServiceService } from "./service.service.interface.js";
import { ServiceCreateDto } from "./dto/request/service-create.dto.js";
import { ServiceFilterDto } from "./dto/request/service-filter.dto.js";
import { ServicePatchDto } from "./dto/request/service-patch.dto.js";
import { ServiceResponseDto } from "./dto/response/service-response.dto.js";
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
import { Public } from "../common/decorators/public.decorator.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { JwtPayloadWithAuth } from "../common/entities/index.js";
import { ServiceMapper } from "./mappers/service.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Service")
@Controller("service")
export class ServiceController {
  constructor(
    @Inject(SERVICE_SERVICE)
    private readonly serviceService: IServiceService,
    private readonly serviceMapper: ServiceMapper,
  ) {}

  /** Verify that the service belongs to the owner's barbershop */
  private async assertOwnership(
    serviceId: string,
    user: JwtPayloadWithAuth,
  ): Promise<void> {
    if (user.loggedInAs !== RoleName.BARBERSHOP_OWNER) return;
    const service = await this.serviceService.getById(serviceId);
    if (service.barbershopId !== user.barbershopId) {
      throw new ForbiddenException(
        "You can only manage services in your own barbershop",
      );
    }
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all services with pagination" })
  @ApiPaginatedResponse(ServiceResponseDto)
  @ApiSortingQuery(["name", "price", "duration", "createdAt"])
  async findAll(
    @Query() filter: ServiceFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(["name", "price", "duration", "createdAt"])
    sort: SortingParam | null,
  ): Promise<PagingDataResponseDto<ServiceResponseDto>> {
    const result = await this.serviceService.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const mappedData = result.data.map((entity) =>
      this.serviceMapper.entityToResponseDto(entity),
    );
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get(":id")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get service by ID" })
  @ApiDataResponse(ServiceResponseDto)
  async findOne(
    @Param("id") id: string,
  ): Promise<DataResponseDto<ServiceResponseDto>> {
    const service = await this.serviceService.getById(id);
    return new DataResponseDto(this.serviceMapper.entityToResponseDto(service));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Create a new service" })
  @ApiCreatedDataResponse(ServiceResponseDto)
  async create(
    @Body() payload: ServiceCreateDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<ServiceResponseDto>> {
    // Owners can only create services in their own barbershop
    if (user.loggedInAs === RoleName.BARBERSHOP_OWNER) {
      payload.barbershopId = user.barbershopId!;
    }
    const service = await this.serviceService.create(payload);
    return new DataResponseDto(this.serviceMapper.entityToResponseDto(service));
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Update a service" })
  @ApiDataResponse(ServiceResponseDto)
  async update(
    @Param("id") id: string,
    @Body() payload: ServicePatchDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<ServiceResponseDto>> {
    await this.assertOwnership(id, user);
    const service = await this.serviceService.update(id, payload);
    return new DataResponseDto(this.serviceMapper.entityToResponseDto(service));
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Delete a service" })
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<MessageResponseDto> {
    await this.assertOwnership(id, user);
    return this.serviceService.remove(id);
  }
}
