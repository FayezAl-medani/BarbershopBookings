import { Injectable } from '@nestjs/common';
import { UserCredential } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { PrismaTransactionContext } from '../common/prisma/prisma-transaction-context.service.js';
import { UserCredentialCreateDto } from './dto/request/user-credential-create.dto.js';

@Injectable()
export class UserCredentialRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(payload: UserCredentialCreateDto): Promise<UserCredential> {
    const client = this.txContext.getClient();
    return await client.userCredential.create({ data: payload as any });
  }

  async findByUserId(userId: string): Promise<UserCredential | null> {
    const client = this.txContext.getClient();
    return await client.userCredential.findFirst({ where: { userId } });
  }

  async findByUserIdAndMethod(userId: string, method: string): Promise<UserCredential | null> {
    const client = this.txContext.getClient();
    return await client.userCredential.findFirst({ where: { userId, method: method as any } });
  }

  async updateById(id: string, data: Partial<UserCredentialCreateDto>): Promise<UserCredential> {
    const client = this.txContext.getClient();
    return await client.userCredential.update({ where: { id }, data: data as any });
  }

  async deleteById(id: string): Promise<void> {
    const client = this.txContext.getClient();
    await client.userCredential.delete({ where: { id } });
  }
}
