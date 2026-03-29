import { Injectable } from "@nestjs/common";
import { Booking, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { paginator } from "../common/prisma/paginator.js";
import { BookingFilterDto } from "./dto/request/booking-filter.dto.js";
import { BookingPatchDto } from "./dto/request/booking-patch.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";

const paginate = paginator({ perPage: 10 });

@Injectable()
export class BookingRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(data: Prisma.BookingUncheckedCreateInput): Promise<Booking> {
    const client = this.txContext.getClient();
    return await client.booking.create({ data });
  }

  async findById(id: string): Promise<Booking | null> {
    const client = this.txContext.getClient();
    return await client.booking.findUnique({ where: { id } });
  }

  async findAllPaging(
    filter: BookingFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<Booking>> {
    const { id, customerId, barberId, serviceId, status, date } = filter;

    const where: Prisma.BookingWhereInput = {
      ...(id && { id }),
      ...(customerId && { customerId }),
      ...(barberId && { barberId }),
      ...(serviceId && { serviceId }),
      ...(status && { status }),
      ...(date && { date: new Date(date) }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: "desc" as const };

    return paginate(
      this.txContext.getClient().booking,
      {
        where,
        orderBy,
        include: {
          customer: { include: { user: true } },
          barber: { include: { user: true } },
          service: true,
        },
      },
      pagingArgs,
    );
  }

  async updateById(
    id: string,
    payload: BookingPatchDto | Prisma.BookingUncheckedUpdateInput,
  ): Promise<Booking> {
    const client = this.txContext.getClient();
    return await client.booking.update({
      where: { id },
      data: payload,
    });
  }

  async deleteById(id: string): Promise<Booking> {
    const client = this.txContext.getClient();
    return await client.booking.delete({ where: { id } });
  }

  /**
   * Find overlapping bookings for a barber on a given date.
   * Used for double-booking prevention.
   */
  async findOverlappingBookings(
    barberId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeBookingId?: string,
  ): Promise<Booking[]> {
    const client = this.txContext.getClient();

    const where: Prisma.BookingWhereInput = {
      barberId,
      date,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      // Two time ranges overlap if: start1 < end2 AND start2 < end1
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      ...(excludeBookingId && { id: { not: excludeBookingId } }),
    };

    return await client.booking.findMany({ where });
  }

  /**
   * Find all non-cancelled bookings for a barber on a given date.
   * Used for availability calculation.
   */
  async findBarberBookingsForDate(
    barberId: string,
    date: Date,
  ): Promise<Booking[]> {
    const client = this.txContext.getClient();
    return await client.booking.findMany({
      where: {
        barberId,
        date,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
      orderBy: { startTime: "asc" },
    });
  }

  async exists(id: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.booking.count({ where: { id } });
    return count > 0;
  }
}
