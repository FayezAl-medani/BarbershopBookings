import { Injectable } from "@nestjs/common";
import { Payment, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { paginator } from "../common/prisma/paginator.js";
import { PaymentFilterDto } from "./dto/request/payment-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";

const paginate = paginator({ perPage: 10 });

@Injectable()
export class PaymentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment> {
    const client = this.txContext.getClient();
    return await client.payment.create({ data });
  }

  async findById(id: string): Promise<Payment | null> {
    const client = this.txContext.getClient();
    return await client.payment.findUnique({ where: { id } });
  }

  async findByBookingId(bookingId: string): Promise<Payment[]> {
    const client = this.txContext.getClient();
    return await client.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllPaging(
    filter: PaymentFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<Payment>> {
    const { id, bookingId, status } = filter;

    const where: Prisma.PaymentWhereInput = {
      ...(id && { id }),
      ...(bookingId && { bookingId }),
      ...(status && { status }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: "desc" as const };

    return paginate(
      this.txContext.getClient().payment,
      { where, orderBy },
      pagingArgs,
    );
  }

  async updateById(
    id: string,
    data: Prisma.PaymentUncheckedUpdateInput,
  ): Promise<Payment> {
    const client = this.txContext.getClient();
    return await client.payment.update({ where: { id }, data });
  }
}
