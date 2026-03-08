import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { PrismaTransactionContext } from '../common/prisma/prisma-transaction-context.service.js';
import { paginator } from '../common/prisma/paginator.js';
import { UserIncludePreset } from './enums/user-include-preset.enum.js';
import { UserCreateDto } from './dto/request/user-create.dto.js';
import { UserFilterDto } from './dto/request/user-filter.dto.js';
import { UserPatchDto } from './dto/request/user-patch.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { IPaginatedResult } from '../common/dto/paging-data-response.dto.js';
import { SortingParam } from '../common/decorators/sorting-params.decorator.js';

const paginate = paginator({ perPage: 10 });

const USER_INCLUDES: Record<UserIncludePreset, Prisma.UserInclude> = {
  [UserIncludePreset.BASIC]: {},
  [UserIncludePreset.WITH_ADMIN]: { admin: true },
  [UserIncludePreset.WITH_BARBER]: { barber: true },
  [UserIncludePreset.WITH_CUSTOMER]: { customer: true },
  [UserIncludePreset.WITH_ROLES]: { userRoles: { include: { role: true } } },
  [UserIncludePreset.FULL]: {
    admin: true,
    barber: true,
    customer: true,
    userRoles: { include: { role: true } },
  },
};

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getInclude(preset?: UserIncludePreset | Prisma.UserInclude): Prisma.UserInclude | undefined {
    if (!preset) return undefined;
    if (typeof preset === 'string') return USER_INCLUDES[preset];
    return preset;
  }

  async create(payload: UserCreateDto, include?: UserIncludePreset | Prisma.UserInclude): Promise<User> {
    const client = this.txContext.getClient();
    return await client.user.create({
      data: payload,
      include: this.getInclude(include),
    });
  }

  async findById(id: string, include?: UserIncludePreset | Prisma.UserInclude): Promise<User | null> {
    const client = this.txContext.getClient();
    return await client.user.findUnique({
      where: { id },
      include: this.getInclude(include),
    });
  }

  async findByPhoneNumber(phoneNumber: string, include?: UserIncludePreset | Prisma.UserInclude): Promise<User | null> {
    const client = this.txContext.getClient();
    return await client.user.findUnique({
      where: { phoneNumber },
      include: this.getInclude(include),
    });
  }

  async findByEmail(email: string, include?: UserIncludePreset | Prisma.UserInclude): Promise<User | null> {
    const client = this.txContext.getClient();
    return await client.user.findUnique({
      where: { email },
      include: this.getInclude(include),
    });
  }

  async findAllPaging(
    filter: UserFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
    include?: UserIncludePreset | Prisma.UserInclude,
  ): Promise<IPaginatedResult<User>> {
    const { id, firstName, phoneNumber, status } = filter;

    const where: Prisma.UserWhereInput = {
      ...(id && { id }),
      ...(firstName && { firstName: { contains: firstName, mode: 'insensitive' as const } }),
      ...(phoneNumber && { phoneNumber: { contains: phoneNumber } }),
      ...(status && { status }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: 'desc' as const };

    return paginate(
      this.txContext.getClient().user,
      { where, orderBy, include: this.getInclude(include) },
      pagingArgs,
    );
  }

  async updateById(id: string, payload: UserPatchDto, include?: UserIncludePreset | Prisma.UserInclude): Promise<User> {
    const client = this.txContext.getClient();
    return await client.user.update({
      where: { id },
      data: payload,
      include: this.getInclude(include),
    });
  }

  async deleteById(id: string): Promise<User> {
    const client = this.txContext.getClient();
    return await client.user.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.user.count({ where: { id } });
    return count > 0;
  }

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.user.count({ where: { phoneNumber } });
    return count > 0;
  }
}
