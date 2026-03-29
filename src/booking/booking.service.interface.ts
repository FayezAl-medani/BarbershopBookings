import { BookingEntity } from "./entities/booking.entity.js";
import { BookingCreateDto } from "./dto/request/booking-create.dto.js";
import { BookingFilterDto } from "./dto/request/booking-filter.dto.js";
import { BookingPatchDto } from "./dto/request/booking-patch.dto.js";
import { AvailabilityResponseDto } from "./dto/response/availability-response.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { MessageResponseDto } from "../common/dto/status.dto.js";

export const BOOKING_SERVICE = "IBookingService";

export interface IBookingService {
  create(payload: BookingCreateDto): Promise<BookingEntity>;
  findAllPaging(
    filter: BookingFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<BookingEntity>>;
  getById(id: string): Promise<BookingEntity>;
  update(id: string, payload: BookingPatchDto): Promise<BookingEntity>;
  cancel(id: string): Promise<MessageResponseDto>;
  complete(id: string): Promise<BookingEntity>;
  getAvailability(
    barberId: string,
    date: string,
    serviceId: string,
  ): Promise<AvailabilityResponseDto>;
}
