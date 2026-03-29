import { Injectable } from "@nestjs/common";
import { Subscription, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { paginator } from "../common/prisma/paginator.js";
import { SubscriptionFilterDto } from "./dto/request/subscription-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";

const paginate = paginator({ perPage: 10 });

@Injectable()
export class SubscriptionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(
    data: Prisma.SubscriptionUncheckedCreateInput,
  ): Promise<Subscription> {
    const client = this.txContext.getClient();
    return await client.subscription.create({ data });
  }

  async findById(id: string): Promise<Subscription | null> {
    const client = this.txContext.getClient();
    return await client.subscription.findUnique({ where: { id } });
  }

  async findActiveByBarbershopId(
    barbershopId: string,
  ): Promise<Subscription | null> {
    const client = this.txContext.getClient();
    return await client.subscription.findFirst({
      where: { barbershopId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllPaging(
    filter: SubscriptionFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<Subscription>> {
    const { id, barbershopId, status } = filter;

    const where: Prisma.SubscriptionWhereInput = {
      ...(id && { id }),
      ...(barbershopId && { barbershopId }),
      ...(status && { status }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: "desc" as const };

    return paginate(
      this.txContext.getClient().subscription,
      { where, orderBy },
      pagingArgs,
    );
  }

  async updateById(
    id: string,
    data: Prisma.SubscriptionUncheckedUpdateInput,
  ): Promise<Subscription> {
    const client = this.txContext.getClient();
    return await client.subscription.update({ where: { id }, data });
  }

  async deleteById(id: string): Promise<Subscription> {
    const client = this.txContext.getClient();
    return await client.subscription.delete({ where: { id } });
  }
}
