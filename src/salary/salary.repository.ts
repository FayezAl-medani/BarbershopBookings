import { Injectable } from "@nestjs/common";
import { Salary, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { paginator } from "../common/prisma/paginator.js";
import { SalaryFilterDto } from "./dto/request/salary-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";

const paginate = paginator({ perPage: 10 });

@Injectable()
export class SalaryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(data: Prisma.SalaryUncheckedCreateInput): Promise<Salary> {
    const client = this.txContext.getClient();
    return await client.salary.create({ data });
  }

  async findById(id: string): Promise<Salary | null> {
    const client = this.txContext.getClient();
    return await client.salary.findUnique({ where: { id } });
  }

  async findAllPaging(
    filter: SalaryFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<Salary>> {
    const { id, barberId, barbershopId, isPaid, dateFrom, dateTo } = filter;

    const where: Prisma.SalaryWhereInput = {
      ...(id && { id }),
      ...(barberId && { barberId }),
      ...(barbershopId && { barber: { barbershopId } }),
      ...(isPaid !== undefined && { isPaid }),
      ...((dateFrom || dateTo) && {
        periodStart: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: "desc" as const };

    return paginate(
      this.txContext.getClient().salary,
      { where, orderBy },
      pagingArgs,
    );
  }

  async updateById(
    id: string,
    data: Prisma.SalaryUncheckedUpdateInput,
  ): Promise<Salary> {
    const client = this.txContext.getClient();
    return await client.salary.update({ where: { id }, data });
  }

  async deleteById(id: string): Promise<Salary> {
    const client = this.txContext.getClient();
    return await client.salary.delete({ where: { id } });
  }

  async getSummaryByBarber(barberId: string): Promise<{
    totalPaid: number;
    totalUnpaid: number;
    paidCount: number;
    unpaidCount: number;
  }> {
    const client = this.txContext.getClient();
    const [paid, unpaid] = await Promise.all([
      client.salary.aggregate({
        where: { barberId, isPaid: true },
        _sum: { amount: true },
        _count: true,
      }),
      client.salary.aggregate({
        where: { barberId, isPaid: false },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      totalPaid: Number(paid._sum.amount || 0),
      totalUnpaid: Number(unpaid._sum.amount || 0),
      paidCount: paid._count,
      unpaidCount: unpaid._count,
    };
  }
}
