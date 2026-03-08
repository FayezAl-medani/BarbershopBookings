import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { PrismaTransactionContext } from '../common/prisma/prisma-transaction-context.service.js';
import { RoleCreateDto } from './dto/request/role-create.dto.js';

@Injectable()
export class RoleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(payload: RoleCreateDto): Promise<Role> {
    const client = this.txContext.getClient();
    return await client.role.create({ data: payload });
  }

  async findById(id: string): Promise<Role | null> {
    const client = this.txContext.getClient();
    return await client.role.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Role | null> {
    const client = this.txContext.getClient();
    return await client.role.findUnique({ where: { name } });
  }

  async findAll(): Promise<Role[]> {
    const client = this.txContext.getClient();
    return await client.role.findMany({ orderBy: { name: 'asc' } });
  }

  async exists(id: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.role.count({ where: { id } });
    return count > 0;
  }

  async existsByName(name: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.role.count({ where: { name } });
    return count > 0;
  }
}
