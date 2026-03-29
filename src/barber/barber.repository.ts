import { Injectable } from "@nestjs/common";
import { Barber, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { paginator } from "../common/prisma/paginator.js";
import { BarberCreateDto } from "./dto/request/barber-create.dto.js";
import { BarberFilterDto } from "./dto/request/barber-filter.dto.js";
import { BarberPatchDto } from "./dto/request/barber-patch.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";

const paginate = paginator({ perPage: 10 });

@Injectable()
export class BarberRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(payload: BarberCreateDto): Promise<Barber> {
    const client = this.txContext.getClient();
    return await client.barber.create({
      data: payload,
      include: { user: true },
    });
  }

  async findById(id: string): Promise<Barber | null> {
    const client = this.txContext.getClient();
    return await client.barber.findUnique({
      where: { id },
      include: {
        user: true,
        barberServices: { include: { service: true } },
        schedules: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Barber | null> {
    const client = this.txContext.getClient();
    return await client.barber.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async findAllPaging(
    filter: BarberFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<Barber>> {
    const { id, userId, barbershopId, specialization, isActive } = filter;

    const where: Prisma.BarberWhereInput = {
      ...(id && { id }),
      ...(userId && { userId }),
      ...(barbershopId && { barbershopId }),
      ...(specialization && {
        specialization: {
          contains: specialization,
          mode: "insensitive" as const,
        },
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: "desc" as const };

    return paginate(
      this.txContext.getClient().barber,
      { where, orderBy, include: { user: true } },
      pagingArgs,
    );
  }

  async updateById(id: string, payload: BarberPatchDto): Promise<Barber> {
    const client = this.txContext.getClient();
    return await client.barber.update({
      where: { id },
      data: payload,
      include: { user: true },
    });
  }

  async deleteById(id: string): Promise<Barber> {
    const client = this.txContext.getClient();
    return await client.barber.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.barber.count({ where: { id } });
    return count > 0;
  }
}
