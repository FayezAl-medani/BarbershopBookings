import { Injectable } from '@nestjs/common';
import { Service, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { PrismaTransactionContext } from '../common/prisma/prisma-transaction-context.service.js';
import { paginator } from '../common/prisma/paginator.js';
import { ServiceCreateDto } from './dto/request/service-create.dto.js';
import { ServiceFilterDto } from './dto/request/service-filter.dto.js';
import { ServicePatchDto } from './dto/request/service-patch.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { IPaginatedResult } from '../common/dto/paging-data-response.dto.js';
import { SortingParam } from '../common/decorators/sorting-params.decorator.js';

const paginate = paginator({ perPage: 10 });

@Injectable()
export class ServiceRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(payload: ServiceCreateDto): Promise<Service> {
    const client = this.txContext.getClient();
    return await client.service.create({ data: payload });
  }

  async findById(id: string): Promise<Service | null> {
    const client = this.txContext.getClient();
    return await client.service.findUnique({ where: { id } });
  }

  async findAllPaging(
    filter: ServiceFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<Service>> {
    const { id, name, isActive } = filter;

    const where: Prisma.ServiceWhereInput = {
      ...(id && { id }),
      ...(name && { name: { contains: name, mode: 'insensitive' as const } }),
      ...(isActive !== undefined && { isActive }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: 'desc' as const };

    return paginate(
      this.txContext.getClient().service,
      { where, orderBy },
      pagingArgs,
    );
  }

  async updateById(id: string, payload: ServicePatchDto): Promise<Service> {
    const client = this.txContext.getClient();
    return await client.service.update({
      where: { id },
      data: payload,
    });
  }

  async deleteById(id: string): Promise<Service> {
    const client = this.txContext.getClient();
    return await client.service.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.service.count({ where: { id } });
    return count > 0;
  }
}
