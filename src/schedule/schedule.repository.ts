import { Injectable } from "@nestjs/common";
import { Schedule, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { ScheduleCreateDto } from "./dto/request/schedule-create.dto.js";
import { ScheduleFilterDto } from "./dto/request/schedule-filter.dto.js";
import { SchedulePatchDto } from "./dto/request/schedule-patch.dto.js";

@Injectable()
export class ScheduleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(payload: ScheduleCreateDto): Promise<Schedule> {
    const client = this.txContext.getClient();
    return await client.schedule.create({ data: payload });
  }

  async findById(id: string): Promise<Schedule | null> {
    const client = this.txContext.getClient();
    return await client.schedule.findUnique({ where: { id } });
  }

  async findByBarberIdAndDay(
    barberId: string,
    dayOfWeek: string,
  ): Promise<Schedule | null> {
    const client = this.txContext.getClient();
    return await client.schedule.findUnique({
      where: { barberId_dayOfWeek: { barberId, dayOfWeek: dayOfWeek as any } },
    });
  }

  async findAllByBarberId(barberId: string): Promise<Schedule[]> {
    const client = this.txContext.getClient();
    return await client.schedule.findMany({
      where: { barberId, isActive: true },
      orderBy: { dayOfWeek: "asc" },
    });
  }

  async findAll(filter: ScheduleFilterDto): Promise<Schedule[]> {
    const { barberId, dayOfWeek, isActive } = filter;

    const where: Prisma.ScheduleWhereInput = {
      ...(barberId && { barberId }),
      ...(dayOfWeek && { dayOfWeek }),
      ...(isActive !== undefined && { isActive }),
    };

    const client = this.txContext.getClient();
    return await client.schedule.findMany({
      where,
      orderBy: { dayOfWeek: "asc" },
    });
  }

  async updateById(id: string, payload: SchedulePatchDto): Promise<Schedule> {
    const client = this.txContext.getClient();
    return await client.schedule.update({
      where: { id },
      data: payload,
    });
  }

  async deleteById(id: string): Promise<Schedule> {
    const client = this.txContext.getClient();
    return await client.schedule.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const client = this.txContext.getClient();
    const count = await client.schedule.count({ where: { id } });
    return count > 0;
  }
}
