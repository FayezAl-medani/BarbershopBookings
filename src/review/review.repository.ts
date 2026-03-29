import { Injectable } from "@nestjs/common";
import { Review, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { paginator } from "../common/prisma/paginator.js";
import { ReviewFilterDto } from "./dto/request/review-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";

const paginate = paginator({ perPage: 10 });

@Injectable()
export class ReviewRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(data: Prisma.ReviewUncheckedCreateInput): Promise<Review> {
    const client = this.txContext.getClient();
    return await client.review.create({ data });
  }

  async findById(id: string): Promise<Review | null> {
    const client = this.txContext.getClient();
    return await client.review.findUnique({ where: { id } });
  }

  async findByBookingId(bookingId: string): Promise<Review | null> {
    const client = this.txContext.getClient();
    return await client.review.findUnique({ where: { bookingId } });
  }

  async findAllPaging(
    filter: ReviewFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<Review>> {
    const { id, barbershopId, barberId, customerId } = filter;

    const where: Prisma.ReviewWhereInput = {
      ...(id && { id }),
      ...(barbershopId && { barbershopId }),
      ...(barberId && { barberId }),
      ...(customerId && { customerId }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: "desc" as const };

    return paginate(
      this.txContext.getClient().review,
      { where, orderBy },
      pagingArgs,
    );
  }

  async deleteById(id: string): Promise<Review> {
    const client = this.txContext.getClient();
    return await client.review.delete({ where: { id } });
  }
}
