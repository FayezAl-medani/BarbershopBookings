import { Injectable } from '@nestjs/common';
import { Customer, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { PrismaTransactionContext } from '../common/prisma/prisma-transaction-context.service.js';
import { paginator } from '../common/prisma/paginator.js';
import { CustomerCreateDto } from './dto/request/customer-create.dto.js';
import { CustomerFilterDto } from './dto/request/customer-filter.dto.js';
import { CustomerPatchDto } from './dto/request/customer-patch.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { IPaginatedResult } from '../common/dto/paging-data-response.dto.js';

const paginate = paginator({ perPage: 10 });

@Injectable()
export class CustomerRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(payload: CustomerCreateDto): Promise<Customer> {
    const client = this.txContext.getClient();
    return await client.customer.create({
      data: payload,
      include: { user: true },
    });
  }

  async findById(id: string): Promise<Customer | null> {
    const client = this.txContext.getClient();
    return await client.customer.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    const client = this.txContext.getClient();
    return await client.customer.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async findAllPaging(
    filter: CustomerFilterDto,
    pagingArgs?: PaginationParams,
  ): Promise<IPaginatedResult<Customer>> {
    const { id, userId } = filter;

    const where: Prisma.CustomerWhereInput = {
      ...(id && { id }),
      ...(userId && { userId }),
    };

    return paginate(
      this.txContext.getClient().customer,
      { where, orderBy: { createdAt: 'desc' as const }, include: { user: true } },
      pagingArgs,
    );
  }

  async updateById(id: string, payload: CustomerPatchDto): Promise<Customer> {
    const client = this.txContext.getClient();
    return await client.customer.update({
      where: { id },
      data: payload,
      include: { user: true },
    });
  }

  async deleteById(id: string): Promise<Customer> {
    const client = this.txContext.getClient();
    return await client.customer.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.customer.count({ where: { id } });
    return count > 0;
  }
}
