import { Injectable } from "@nestjs/common";
import { Notification, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { paginator } from "../common/prisma/paginator.js";
import { NotificationFilterDto } from "./dto/request/notification-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";

const paginate = paginator({ perPage: 10 });

@Injectable()
export class NotificationRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async create(
    data: Prisma.NotificationUncheckedCreateInput,
  ): Promise<Notification> {
    const client = this.txContext.getClient();
    return await client.notification.create({ data });
  }

  async findById(id: string): Promise<Notification | null> {
    const client = this.txContext.getClient();
    return await client.notification.findUnique({ where: { id } });
  }

  async findAllPaging(
    userId: string,
    filter: NotificationFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<Notification>> {
    const { type, isRead } = filter;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(type && { type: type as any }),
      ...(isRead !== undefined && { isRead }),
    };

    const orderBy = sort
      ? { [sort.property]: sort.direction }
      : { createdAt: "desc" as const };

    return paginate(
      this.txContext.getClient().notification,
      { where, orderBy },
      pagingArgs,
    );
  }

  async countUnread(userId: string): Promise<number> {
    const client = this.txContext.getClient();
    return await client.notification.count({
      where: { userId, isRead: false },
    });
  }

  async updateById(
    id: string,
    data: Prisma.NotificationUncheckedUpdateInput,
  ): Promise<Notification> {
    const client = this.txContext.getClient();
    return await client.notification.update({ where: { id }, data });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const client = this.txContext.getClient();
    await client.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteById(id: string): Promise<Notification> {
    const client = this.txContext.getClient();
    return await client.notification.delete({ where: { id } });
  }
}
