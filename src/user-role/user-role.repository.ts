import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { PrismaTransactionContext } from '../common/prisma/prisma-transaction-context.service.js';
import { UserRoleCreateDto } from './dto/request/user-role-create.dto.js';

@Injectable()
export class UserRoleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(payload: UserRoleCreateDto): Promise<UserRole> {
    const client = this.txContext.getClient();
    return await client.userRole.create({
      data: payload,
      include: { role: true },
    });
  }

  async findAllByUserId(userId: string): Promise<UserRole[]> {
    const client = this.txContext.getClient();
    return await client.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }

  async existByUserIdAndRoleId(userId: string, roleId: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.userRole.count({
      where: { userId, roleId },
    });
    return count > 0;
  }
}
