import { Injectable } from '@nestjs/common';
import { ActiveOtp } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { PrismaTransactionContext } from '../common/prisma/prisma-transaction-context.service.js';
import { ActiveOtpCreateDto } from './dto/request/active-otp-create.dto.js';

@Injectable()
export class ActiveOtpRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(payload: ActiveOtpCreateDto): Promise<ActiveOtp> {
    const client = this.txContext.getClient();
    return await client.activeOtp.create({ data: payload });
  }

  async findByIdentifier(identifier: string): Promise<ActiveOtp | null> {
    const client = this.txContext.getClient();
    return await client.activeOtp.findFirst({
      where: { identifier },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateById(id: string, data: Partial<ActiveOtpCreateDto>): Promise<ActiveOtp> {
    const client = this.txContext.getClient();
    return await client.activeOtp.update({ where: { id }, data: data as any });
  }

  async deleteById(id: string): Promise<void> {
    const client = this.txContext.getClient();
    await client.activeOtp.delete({ where: { id } });
  }

  async deleteExpiredOtps(): Promise<number> {
    const client = this.txContext.getClient();
    const result = await client.activeOtp.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}
