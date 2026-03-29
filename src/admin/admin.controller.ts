import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { ADMIN_SERVICE } from "./admin.service.interface.js";
import type { IAdminService } from "./admin.service.interface.js";
import { AdminRegisterDto } from "./dto/request/admin-register.dto.js";
import { AdminFilterDto } from "./dto/request/admin-filter.dto.js";
import { AdminResponseDto } from "./dto/response/admin-response.dto.js";
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
import { RoleName } from "../common/enums/role-name.enum.js";
import { AdminMapper } from "./mappers/admin.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Admin")
@Controller("admin")
export class AdminController {
  constructor(
    @Inject(ADMIN_SERVICE)
    private readonly adminService: IAdminService,
    private readonly adminMapper: AdminMapper,
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Register a new admin user" })
  @ApiCreatedDataResponse(AdminResponseDto)
  async registerAdmin(
    @Body() payload: AdminRegisterDto,
  ): Promise<DataResponseDto<AdminResponseDto>> {
    const admin = await this.adminService.registerAdminUser(payload);
    return new DataResponseDto(this.adminMapper.entityToResponseDto(admin));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Get all admins with pagination" })
  @ApiPaginatedResponse(AdminResponseDto)
  @ApiSortingQuery(["email", "createdAt"])
  async findAll(
    @Query() filter: AdminFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(["email", "createdAt"]) sort: SortingParam | null,
  ): Promise<PagingDataResponseDto<AdminResponseDto>> {
    const result = await this.adminService.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const mappedData = result.data.map((entity) =>
      this.adminMapper.entityToResponseDto(entity),
    );
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Get admin by ID" })
  @ApiDataResponse(AdminResponseDto)
  async findOne(
    @Param("id") id: string,
  ): Promise<DataResponseDto<AdminResponseDto>> {
    const admin = await this.adminService.getById(id);
    return new DataResponseDto(this.adminMapper.entityToResponseDto(admin));
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Delete an admin" })
  async remove(@Param("id") id: string): Promise<MessageResponseDto> {
    return this.adminService.remove(id);
  }
}
