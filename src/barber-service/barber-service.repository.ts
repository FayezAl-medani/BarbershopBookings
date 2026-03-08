import { Injectable } from '@nestjs/common';
import { BarberService } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { PrismaTransactionContext } from '../common/prisma/prisma-transaction-context.service.js';

@Injectable()
export class BarberServiceRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(barberId: string, serviceId: string): Promise<BarberService> {
    const client = this.txContext.getClient();
    return await client.barberService.create({
      data: { barberId, serviceId },
      include: { service: true },
    });
  }

  async findAllByBarberId(barberId: string): Promise<BarberService[]> {
    const client = this.txContext.getClient();
    return await client.barberService.findMany({
      where: { barberId },
      include: { service: true },
    });
  }

  async exists(barberId: string, serviceId: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.barberService.count({
      where: { barberId, serviceId },
    });
    return count > 0;
  }

  async delete(barberId: string, serviceId: string): Promise<BarberService> {
    const client = this.txContext.getClient();
    return await client.barberService.delete({
      where: { barberId_serviceId: { barberId, serviceId } },
    });
  }
}
