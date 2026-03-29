import {
  Controller,
  Get,
  Post,
  Patch,
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
import { PAYMENT_SERVICE } from "./payment.service.interface.js";
import type { IPaymentService } from "./payment.service.interface.js";
import { PaymentCreateDto } from "./dto/request/payment-create.dto.js";
import { PaymentFilterDto } from "./dto/request/payment-filter.dto.js";
import { PaymentSuccessDto } from "./dto/request/payment-success.dto.js";
import { PaymentFailDto } from "./dto/request/payment-fail.dto.js";
import { PaymentResponseDto } from "./dto/response/payment-response.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import {
  DataResponseDto,
  DataArrayResponseDto,
} from "../common/dto/data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import { ErrorResponseDto } from "../common/dto/status.dto.js";
import {
  SortingParams,
  SortingParam,
} from "../common/decorators/sorting-params.decorator.js";
import { ApiSortingQuery } from "../common/decorators/sorting-params-swagger.decorator.js";
import {
  ApiDataResponse,
  ApiDataArrayResponse,
  ApiPaginatedResponse,
  ApiCreatedDataResponse,
} from "../common/decorators/response.decorator.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { PaymentMapper } from "./mappers/payment.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Payment")
@Controller("payment")
export class PaymentController {
  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: IPaymentService,
    private readonly paymentMapper: PaymentMapper,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Get all payments with pagination" })
  @ApiPaginatedResponse(PaymentResponseDto)
  @ApiSortingQuery(["amount", "createdAt", "status", "type"])
  async findAll(
    @Query() filter: PaymentFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(["amount", "createdAt", "status", "type"])
    sort: SortingParam | null,
  ): Promise<PagingDataResponseDto<PaymentResponseDto>> {
    const result = await this.paymentService.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const mappedData = result.data.map((entity) =>
      this.paymentMapper.entityToResponseDto(entity),
    );
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get("booking/:bookingId")
  @HttpCode(HttpStatus.OK)
  @ApiDataArrayResponse(PaymentResponseDto)
  @ApiOperation({ summary: "Get all payments for a booking" })
  async findByBooking(
    @Param("bookingId") bookingId: string,
  ): Promise<DataArrayResponseDto<PaymentResponseDto>> {
    const payments = await this.paymentService.getByBookingId(bookingId);
    return new DataArrayResponseDto(
      payments.map((p) => this.paymentMapper.entityToResponseDto(p)),
    );
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get payment by ID" })
  @ApiDataResponse(PaymentResponseDto)
  async findOne(
    @Param("id") id: string,
  ): Promise<DataResponseDto<PaymentResponseDto>> {
    const payment = await this.paymentService.getById(id);
    return new DataResponseDto(this.paymentMapper.entityToResponseDto(payment));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Record a payment transaction" })
  @ApiCreatedDataResponse(PaymentResponseDto)
  async create(
    @Body() payload: PaymentCreateDto,
  ): Promise<DataResponseDto<PaymentResponseDto>> {
    const payment = await this.paymentService.create(payload);
    return new DataResponseDto(this.paymentMapper.entityToResponseDto(payment));
  }

  @Patch(":id/success")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: "Mark payment as successful" })
  @ApiDataResponse(PaymentResponseDto)
  async markAsSuccess(
    @Param("id") id: string,
    @Body() body: PaymentSuccessDto,
  ): Promise<DataResponseDto<PaymentResponseDto>> {
    const payment = await this.paymentService.markAsSuccess(
      id,
      body.gatewayRef,
    );
    return new DataResponseDto(this.paymentMapper.entityToResponseDto(payment));
  }

  @Patch(":id/fail")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: "Mark payment as failed" })
  @ApiDataResponse(PaymentResponseDto)
  async markAsFailed(
    @Param("id") id: string,
    @Body() body: PaymentFailDto,
  ): Promise<DataResponseDto<PaymentResponseDto>> {
    const payment = await this.paymentService.markAsFailed(id, body.reason);
    return new DataResponseDto(this.paymentMapper.entityToResponseDto(payment));
  }

  @Post(":id/refund")
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: "Refund a successful payment" })
  @ApiCreatedDataResponse(PaymentResponseDto)
  async refund(
    @Param("id") id: string,
  ): Promise<DataResponseDto<PaymentResponseDto>> {
    const payment = await this.paymentService.refund(id);
    return new DataResponseDto(this.paymentMapper.entityToResponseDto(payment));
  }
}
