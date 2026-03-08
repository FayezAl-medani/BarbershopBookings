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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { BOOKING_SERVICE } from './booking.service.interface.js';
import type { IBookingService } from './booking.service.interface.js';
import { BookingCreateDto } from './dto/request/booking-create.dto.js';
import { BookingFilterDto } from './dto/request/booking-filter.dto.js';
import { BookingPatchDto } from './dto/request/booking-patch.dto.js';
import { BookingResponseDto } from './dto/response/booking-response.dto.js';
import { AvailabilityResponseDto } from './dto/response/availability-response.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { DataResponseDto } from '../common/dto/data-response.dto.js';
import { PagingDataResponseDto } from '../common/dto/paging-data-response.dto.js';
import { ErrorResponseDto, MessageResponseDto } from '../common/dto/status.dto.js';
import { SortingParams, SortingParam } from '../common/decorators/sorting-params.decorator.js';
import { ApiSortingQuery } from '../common/decorators/sorting-params-swagger.decorator.js';
import { ApiDataResponse, ApiPaginatedResponse, ApiCreatedDataResponse } from '../common/decorators/response.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { RoleName } from '../common/enums/role-name.enum.js';
import { BookingMapper } from './mappers/booking.mapper.js';

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth('access-token')
@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(
    @Inject(BOOKING_SERVICE)
    private readonly bookingService: IBookingService,
    private readonly bookingMapper: BookingMapper,
  ) {}

  @Get('availability/:barberId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get available time slots for a barber on a given date' })
  @ApiDataResponse(AvailabilityResponseDto)
  async getAvailability(
    @Param('barberId') barberId: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId: string,
  ): Promise<DataResponseDto<AvailabilityResponseDto>> {
    const availability = await this.bookingService.getAvailability(barberId, date, serviceId);
    return new DataResponseDto(availability);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all bookings with pagination' })
  @ApiPaginatedResponse(BookingResponseDto)
  @ApiSortingQuery(['date', 'startTime', 'createdAt', 'status'])
  async findAll(
    @Query() filter: BookingFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(['date', 'startTime', 'createdAt', 'status']) sort: SortingParam | null,
  ): Promise<PagingDataResponseDto<BookingResponseDto>> {
    const result = await this.bookingService.findAllPaging(filter, pagingArgs, sort);
    const mappedData = result.data.map((entity) => this.bookingMapper.entityToResponseDto(entity));
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiDataResponse(BookingResponseDto)
  async findOne(@Param('id') id: string): Promise<DataResponseDto<BookingResponseDto>> {
    const booking = await this.bookingService.getById(id);
    return new DataResponseDto(this.bookingMapper.entityToResponseDto(booking));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking (with availability & double-booking check)' })
  @ApiCreatedDataResponse(BookingResponseDto)
  async create(@Body() payload: BookingCreateDto): Promise<DataResponseDto<BookingResponseDto>> {
    const booking = await this.bookingService.create(payload);
    return new DataResponseDto(this.bookingMapper.entityToResponseDto(booking));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update booking details' })
  @ApiDataResponse(BookingResponseDto)
  async update(
    @Param('id') id: string,
    @Body() payload: BookingPatchDto,
  ): Promise<DataResponseDto<BookingResponseDto>> {
    const booking = await this.bookingService.update(id, payload);
    return new DataResponseDto(this.bookingMapper.entityToResponseDto(booking));
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancel(@Param('id') id: string): Promise<MessageResponseDto> {
    return this.bookingService.cancel(id);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBER)
  @ApiOperation({ summary: 'Mark booking as completed' })
  @ApiDataResponse(BookingResponseDto)
  async complete(@Param('id') id: string): Promise<DataResponseDto<BookingResponseDto>> {
    const booking = await this.bookingService.complete(id);
    return new DataResponseDto(this.bookingMapper.entityToResponseDto(booking));
  }
}
