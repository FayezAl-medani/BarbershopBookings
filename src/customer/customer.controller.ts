import {
  Controller,
  Get,
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
import { CUSTOMER_SERVICE } from "./customer.service.interface.js";
import type { ICustomerService } from "./customer.service.interface.js";
import { CustomerFilterDto } from "./dto/request/customer-filter.dto.js";
import { CustomerResponseDto } from "./dto/response/customer-response.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { DataResponseDto } from "../common/dto/data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import { ErrorResponseDto } from "../common/dto/status.dto.js";
import {
  ApiDataResponse,
  ApiPaginatedResponse,
} from "../common/decorators/response.decorator.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { CustomerMapper } from "./mappers/customer.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Customer")
@Controller("customer")
export class CustomerController {
  constructor(
    @Inject(CUSTOMER_SERVICE)
    private readonly customerService: ICustomerService,
    private readonly customerMapper: CustomerMapper,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Get all customers with pagination" })
  @ApiPaginatedResponse(CustomerResponseDto)
  async findAll(
    @Query() filter: CustomerFilterDto,
    @Query() pagingArgs: PaginationParams,
  ): Promise<PagingDataResponseDto<CustomerResponseDto>> {
    const result = await this.customerService.findAllPaging(filter, pagingArgs);
    const mappedData = result.data.map((entity) =>
      this.customerMapper.entityToResponseDto(entity),
    );
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Get customer by ID" })
  @ApiDataResponse(CustomerResponseDto)
  async findOne(
    @Param("id") id: string,
  ): Promise<DataResponseDto<CustomerResponseDto>> {
    const customer = await this.customerService.getById(id);
    return new DataResponseDto(
      this.customerMapper.entityToResponseDto(customer),
    );
  }
}
