import { Injectable } from "@nestjs/common";
import { Commission, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { paginator } from "../common/prisma/paginator.js";
import { CommissionFilterDto } from "./dto/request/commission-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";

const paginate = paginator({ perPage: 10 });

@Injectable()
export class CommissionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(
    data: Prisma.CommissionUncheckedCreateInput,
  ): Promise<Commission> {
    const client = this.txContext.getClient();
    return await client.commission.create({ data });
  }

  async findById(id: string): Promise<Commission | null> {
    const client = this.txContext.getClient();
    return await client.commission.findUnique({ where: { id } });
  }

  async findByBookingId(bookingId: string): Promise<Commission | null> {
    const client = this.txContext.getClient();
    return await client.commission.findUnique({ where: { bookingId } });
  }

  async findAllPaging(
    filter: CommissionFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<Commission>> {
    const { id, barberId, barbershopId, status, dateFrom, dateTo } = filter;

    const where: Prisma.CommissionWhereInput = {
      ...(id && { id }),
      ...(barberId && { barberId }),
      ...(barbershopId && { barber: { barbershopId } }),
      ...(status && { status }),
      ...((dateFrom || dateTo) && {
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: "desc" as const };

    return paginate(
      this.txContext.getClient().commission,
      { where, orderBy },
      pagingArgs,
    );
  }

  async updateById(
    id: string,
    data: Prisma.CommissionUncheckedUpdateInput,
  ): Promise<Commission> {
    const client = this.txContext.getClient();
    return await client.commission.update({ where: { id }, data });
  }

  async getSummary(): Promise<{
    totalPending: number;
    totalCollected: number;
    pendingCount: number;
    collectedCount: number;
  }> {
    const client = this.txContext.getClient();
    const [pending, collected] = await Promise.all([
      client.commission.aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true },
        _count: true,
      }),
      client.commission.aggregate({
        where: { status: "COLLECTED" },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      totalPending: Number(pending._sum.amount || 0),
      totalCollected: Number(collected._sum.amount || 0),
      pendingCount: pending._count,
      collectedCount: collected._count,
    };
  }
}
