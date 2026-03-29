import { Injectable } from "@nestjs/common";
import { Barbershop, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { paginator } from "../common/prisma/paginator.js";
import { BarbershopCreateDto } from "./dto/request/barbershop-create.dto.js";
import { BarbershopFilterDto } from "./dto/request/barbershop-filter.dto.js";
import { BarbershopPatchDto } from "./dto/request/barbershop-patch.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";

const paginate = paginator({ perPage: 10 });

@Injectable()
export class BarbershopRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(payload: BarbershopCreateDto): Promise<Barbershop> {
    const client = this.txContext.getClient();
    return await client.barbershop.create({ data: payload });
  }

  async findById(id: string): Promise<Barbershop | null> {
    const client = this.txContext.getClient();
    return await client.barbershop.findUnique({
      where: { id },
      include: {
        images: { orderBy: { displayOrder: "asc" } },
        _count: { select: { reviews: true } },
      },
    });
  }

  async findAllPaging(
    filter: BarbershopFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<Barbershop>> {
    const { id, name, city, ownerId, isActive } = filter;

    const where: Prisma.BarbershopWhereInput = {
      ...(id && { id }),
      ...(name && { name: { contains: name, mode: "insensitive" as const } }),
      ...(city && { city: { contains: city, mode: "insensitive" as const } }),
      ...(ownerId && { ownerId }),
      ...(isActive !== undefined && { isActive }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: "desc" as const };

    return paginate(
      this.txContext.getClient().barbershop,
      { where, orderBy },
      pagingArgs,
    );
  }

  async updateById(
    id: string,
    payload: BarbershopPatchDto,
  ): Promise<Barbershop> {
    const client = this.txContext.getClient();
    return await client.barbershop.update({
      where: { id },
      data: payload,
    });
  }

  async deleteById(id: string): Promise<Barbershop> {
    const client = this.txContext.getClient();
    return await client.barbershop.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.barbershop.count({ where: { id } });
    return count > 0;
  }

  async getAverageRating(id: string): Promise<number | null> {
    const client = this.txContext.getClient();
    const result = await client.review.aggregate({
      where: { barbershopId: id },
      _avg: { rating: true },
    });
    return result._avg.rating;
  }
}
