import { Injectable } from "@nestjs/common";
import { Admin, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { paginator } from "../common/prisma/paginator.js";
import { AdminCreateDto } from "./dto/request/admin-create.dto.js";
import { AdminFilterDto } from "./dto/request/admin-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";

const paginate = paginator({ perPage: 10 });

@Injectable()
export class AdminRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(payload: AdminCreateDto): Promise<Admin> {
    const client = this.txContext.getClient();
    return await client.admin.create({
      data: payload,
      include: { user: true },
    });
  }

  async findAllPaging(
    filter: AdminFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<Admin>> {
    const { id, userId, email } = filter;

    const where: Prisma.AdminWhereInput = {
      ...(id && { id }),
      ...(userId && { userId }),
      ...(email && {
        email: { contains: email, mode: "insensitive" as const },
      }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: "desc" as const };

    return paginate(
      this.txContext.getClient().admin,
      { where, orderBy, include: { user: true } },
      pagingArgs,
    );
  }

  async findById(id: string): Promise<Admin | null> {
    const client = this.txContext.getClient();
    return await client.admin.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByUserId(userId: string): Promise<Admin | null> {
    const client = this.txContext.getClient();
    return await client.admin.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const client = this.txContext.getClient();
    return await client.admin.findUnique({
      where: { email },
      include: { user: true },
    });
  }

  async exists(id: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.admin.count({ where: { id } });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.admin.count({ where: { email } });
    return count > 0;
  }

  async deleteById(id: string): Promise<Admin> {
    const client = this.txContext.getClient();
    return await client.admin.delete({ where: { id } });
  }
}
