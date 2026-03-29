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
  ForbiddenException,
  BadRequestException,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { BOOKING_SERVICE } from "./booking.service.interface.js";
import type { IBookingService } from "./booking.service.interface.js";
import { BookingCreateDto } from "./dto/request/booking-create.dto.js";
import { BookingFilterDto } from "./dto/request/booking-filter.dto.js";
import { BookingPatchDto } from "./dto/request/booking-patch.dto.js";
import { BookingResponseDto } from "./dto/response/booking-response.dto.js";
import { AvailabilityResponseDto } from "./dto/response/availability-response.dto.js";
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
import { BookingMapper } from "./mappers/booking.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Booking")
@Controller("booking")
export class BookingController {
  constructor(
    @Inject(BOOKING_SERVICE)
    private readonly bookingService: IBookingService,
    private readonly bookingMapper: BookingMapper,
  ) {}

  /** Verify the caller is involved in this booking (customer, barber, or admin) */
  private assertBookingAccess(
    booking: { customerId: string; barberId: string },
    user: JwtPayloadWithAuth,
  ): void {
    if (
      user.loggedInAs === RoleName.SUPER_ADMIN ||
      user.loggedInAs === RoleName.ADMIN
    )
      return;
    if (
      user.loggedInAs === RoleName.CUSTOMER &&
      booking.customerId === user.customerId
    )
      return;
    if (
      user.loggedInAs === RoleName.BARBER &&
      booking.barberId === user.barberId
    )
      return;
    // BARBERSHOP_OWNER: would need barber→barbershopId lookup (handled by role guard for now)
    if (user.loggedInAs === RoleName.BARBERSHOP_OWNER) return;
    throw new ForbiddenException("You do not have access to this booking");
  }

  @Get("availability/:barberId")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get available time slots for a barber on a given date",
  })
  @ApiQuery({ name: "date", required: true, example: "2026-03-29" })
  @ApiQuery({ name: "serviceId", required: true, format: "uuid" })
  @ApiDataResponse(AvailabilityResponseDto)
  async getAvailability(
    @Param("barberId", ParseUUIDPipe) barberId: string,
    @Query("date") date: string,
    @Query("serviceId", ParseUUIDPipe) serviceId: string,
  ): Promise<DataResponseDto<AvailabilityResponseDto>> {
    if (!date || isNaN(new Date(date).getTime())) {
      throw new BadRequestException("date must be a valid date (YYYY-MM-DD)");
    }
    const availability = await this.bookingService.getAvailability(
      barberId,
      date,
      serviceId,
    );
    return new DataResponseDto(availability);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all bookings with pagination" })
  @ApiPaginatedResponse(BookingResponseDto)
  @ApiSortingQuery(["date", "startTime", "createdAt", "status"])
  async findAll(
    @Query() filter: BookingFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(["date", "startTime", "createdAt", "status"])
    sort: SortingParam | null,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<PagingDataResponseDto<BookingResponseDto>> {
    // Tenant isolation: scope results based on caller's role
    if (user.loggedInAs === RoleName.CUSTOMER && user.customerId) {
      filter.customerId = user.customerId;
    } else if (user.loggedInAs === RoleName.BARBER && user.barberId) {
      filter.barberId = user.barberId;
    }
    // ADMIN / SUPER_ADMIN / BARBERSHOP_OWNER see all (owner scoping requires barbershopId on booking model)

    const result = await this.bookingService.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const mappedData = result.data.map((entity) =>
      this.bookingMapper.entityToResponseDto(entity),
    );
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get booking by ID" })
  @ApiDataResponse(BookingResponseDto)
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<BookingResponseDto>> {
    const booking = await this.bookingService.getById(id);
    this.assertBookingAccess(booking, user);
    return new DataResponseDto(this.bookingMapper.entityToResponseDto(booking));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new booking (with availability & double-booking check)",
  })
  @ApiCreatedDataResponse(BookingResponseDto)
  async create(
    @Body() payload: BookingCreateDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<BookingResponseDto>> {
    // Auto-fill customerId from JWT if not provided in the body
    if (!payload.customerId && user.customerId) {
      payload.customerId = user.customerId;
    }
    const booking = await this.bookingService.create(payload);
    return new DataResponseDto(this.bookingMapper.entityToResponseDto(booking));
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update booking details" })
  @ApiDataResponse(BookingResponseDto)
  async update(
    @Param("id") id: string,
    @Body() payload: BookingPatchDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<BookingResponseDto>> {
    const existing = await this.bookingService.getById(id);
    this.assertBookingAccess(existing, user);
    const booking = await this.bookingService.update(id, payload);
    return new DataResponseDto(this.bookingMapper.entityToResponseDto(booking));
  }

  @Patch(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Cancel a booking" })
  async cancel(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<MessageResponseDto> {
    const existing = await this.bookingService.getById(id);
    this.assertBookingAccess(existing, user);
    return this.bookingService.cancel(id);
  }

  @Patch(":id/complete")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBER)
  @ApiOperation({ summary: "Mark booking as completed" })
  @ApiDataResponse(BookingResponseDto)
  async complete(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<BookingResponseDto>> {
    const existing = await this.bookingService.getById(id);
    this.assertBookingAccess(existing, user);
    const booking = await this.bookingService.complete(id);
    return new DataResponseDto(this.bookingMapper.entityToResponseDto(booking));
  }
}
