import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IBookingService } from './booking.service.interface.js';
import { BookingRepository } from './booking.repository.js';
import { BookingMapper } from './mappers/booking.mapper.js';
import { BookingEntity } from './entities/booking.entity.js';
import { BookingCreateDto } from './dto/request/booking-create.dto.js';
import { BookingFilterDto } from './dto/request/booking-filter.dto.js';
import { BookingPatchDto } from './dto/request/booking-patch.dto.js';
import { AvailabilityResponseDto, TimeSlotDto } from './dto/response/availability-response.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { SortingParam } from '../common/decorators/sorting-params.decorator.js';
import { IPaginatedResult } from '../common/dto/paging-data-response.dto.js';
import { PagingDataResponseDto } from '../common/dto/paging-data-response.dto.js';
import { MessageResponseDto, SuccessResponseDto } from '../common/dto/status.dto.js';
import { BookingStatus } from './enums/booking-status.enum.js';
import { BARBER_SERVICE_SERVICE } from '../barber-service/barber-service.service.interface.js';
import type { IBarberServiceService } from '../barber-service/barber-service.service.interface.js';
import { SERVICE_SERVICE } from '../service/service.service.interface.js';
import type { IServiceService } from '../service/service.service.interface.js';
import { SCHEDULE_SERVICE } from '../schedule/schedule.service.interface.js';
import type { IScheduleService } from '../schedule/schedule.service.interface.js';

@Injectable()
export class BookingService implements IBookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly bookingMapper: BookingMapper,
    private readonly i18nService: I18nService,
    @Inject(BARBER_SERVICE_SERVICE)
    private readonly barberServiceService: IBarberServiceService,
    @Inject(SERVICE_SERVICE)
    private readonly serviceService: IServiceService,
    @Inject(SCHEDULE_SERVICE)
    private readonly scheduleService: IScheduleService,
  ) {}

  async create(payload: BookingCreateDto): Promise<BookingEntity> {
    // 1. Verify the barber offers this service
    const offersService = await this.barberServiceService.barberOffersService(
      payload.barberId,
      payload.serviceId,
    );
    if (!offersService) {
      throw new BadRequestException(
        this.i18nService.translate('errors.BOOKING.BARBER_DOES_NOT_OFFER_SERVICE'),
      );
    }

    // 2. Get service duration to calculate end time
    const service = await this.serviceService.getById(payload.serviceId);
    const endTime = this.addMinutesToTime(payload.startTime, service.duration);

    // 3. Check the booking is within barber's working hours
    const bookingDate = new Date(payload.date);
    const dayOfWeek = this.getDayOfWeek(bookingDate);

    const schedules = await this.scheduleService.findAll({
      barberId: payload.barberId,
      dayOfWeek: dayOfWeek as any,
      isActive: true,
    });

    if (schedules.length === 0) {
      throw new BadRequestException(
        this.i18nService.translate('errors.BOOKING.OUTSIDE_WORKING_HOURS'),
      );
    }

    const schedule = schedules[0];
    if (payload.startTime < schedule.startTime || endTime > schedule.endTime) {
      throw new BadRequestException(
        this.i18nService.translate('errors.BOOKING.OUTSIDE_WORKING_HOURS'),
      );
    }

    // 4. Check for double booking
    const overlapping = await this.bookingRepository.findOverlappingBookings(
      payload.barberId,
      bookingDate,
      payload.startTime,
      endTime,
    );

    if (overlapping.length > 0) {
      throw new ConflictException(
        this.i18nService.translate('errors.BOOKING.DOUBLE_BOOKING'),
      );
    }

    // 5. Create the booking
    const booking = await this.bookingRepository.create({
      customerId: payload.customerId,
      barberId: payload.barberId,
      serviceId: payload.serviceId,
      date: bookingDate,
      startTime: payload.startTime,
      endTime,
      status: BookingStatus.CONFIRMED,
      notes: payload.notes,
    });

    return this.bookingMapper.modelToEntity(booking);
  }

  async findAllPaging(
    filter: BookingFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<BookingEntity>> {
    const result = await this.bookingRepository.findAllPaging(filter, pagingArgs, sort);
    const data = result.data.map((res) => this.bookingMapper.modelToEntity(res));
    return new PagingDataResponseDto(data, result.meta);
  }

  async getById(id: string): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException(
        this.i18nService.translate('errors.BOOKING.NOT_FOUND'),
      );
    }
    return this.bookingMapper.modelToEntity(booking);
  }

  async update(id: string, payload: BookingPatchDto): Promise<BookingEntity> {
    await this.getById(id);
    const updated = await this.bookingRepository.updateById(id, payload);
    return this.bookingMapper.modelToEntity(updated);
  }

  async cancel(id: string): Promise<MessageResponseDto> {
    const booking = await this.getById(id);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException(
        this.i18nService.translate('errors.BOOKING.CANNOT_CANCEL'),
      );
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException(
        this.i18nService.translate('errors.BOOKING.CANNOT_CANCEL'),
      );
    }

    await this.bookingRepository.updateById(id, { status: BookingStatus.CANCELLED });
    return new SuccessResponseDto(
      this.i18nService.translate('messages.BOOKING.CANCELLED'),
    );
  }

  async complete(id: string): Promise<BookingEntity> {
    await this.getById(id);
    const updated = await this.bookingRepository.updateById(id, {
      status: BookingStatus.COMPLETED,
    });
    return this.bookingMapper.modelToEntity(updated);
  }

  async getAvailability(
    barberId: string,
    date: string,
    serviceId: string,
  ): Promise<AvailabilityResponseDto> {
    // 1. Get service duration
    const service = await this.serviceService.getById(serviceId);
    const duration = service.duration;

    // 2. Get barber's schedule for this day
    const bookingDate = new Date(date);
    const dayOfWeek = this.getDayOfWeek(bookingDate);

    const schedules = await this.scheduleService.findAll({
      barberId,
      dayOfWeek: dayOfWeek as any,
      isActive: true,
    });

    if (schedules.length === 0) {
      return { barberId, date, availableSlots: [] };
    }

    const schedule = schedules[0];

    // 3. Get existing bookings for the day
    const existingBookings = await this.bookingRepository.findBarberBookingsForDate(
      barberId,
      bookingDate,
    );

    // 4. Generate available time slots
    const availableSlots: TimeSlotDto[] = [];
    let currentTime = schedule.startTime;

    while (true) {
      const slotEnd = this.addMinutesToTime(currentTime, duration);

      // Stop if slot goes past end of working hours
      if (slotEnd > schedule.endTime) break;

      // Check if this slot overlaps with any existing booking
      const isOverlapping = existingBookings.some(
        (booking) => currentTime < booking.endTime && slotEnd > booking.startTime,
      );

      if (!isOverlapping) {
        availableSlots.push({ startTime: currentTime, endTime: slotEnd });
      }

      // Move to next slot (increment by service duration)
      currentTime = this.addMinutesToTime(currentTime, duration);
    }

    return { barberId, date, availableSlots };
  }

  // ─── Helper Methods ───────────────────────────────────

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }

  private getDayOfWeek(date: Date): string {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getUTCDay()];
  }
}
