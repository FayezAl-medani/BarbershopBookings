import { Injectable } from '@nestjs/common';
import { Admin, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { PrismaTransactionContext } from '../common/prisma/prisma-transaction-context.service.js';
import { AdminCreateDto } from './dto/request/admin-create.dto.js';

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
