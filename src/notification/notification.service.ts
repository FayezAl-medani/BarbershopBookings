import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { INotificationService } from "./notification.service.interface.js";
import { NotificationRepository } from "./notification.repository.js";
import { NotificationMapper } from "./mappers/notification.mapper.js";
import { NotificationEntity } from "./entities/notification.entity.js";
import { NotificationFilterDto } from "./dto/request/notification-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import {
  MessageResponseDto,
  SuccessResponseDto,
} from "../common/dto/status.dto.js";

@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationMapper: NotificationMapper,
    private readonly i18nService: I18nService,
  ) {}

  async create(
    userId: string,
    title: string,
    body: string,
    type: string,
    data?: any,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.create({
      userId,
      title,
      body,
      type: type as any,
      data: data ?? undefined,
    });
    return this.notificationMapper.modelToEntity(notification);
  }

  async findAllPaging(
    userId: string,
    filter: NotificationFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<NotificationEntity>> {
    const result = await this.notificationRepository.findAllPaging(
      userId,
      filter,
      pagingArgs,
      sort,
    );
    const data = result.data.map((res) =>
      this.notificationMapper.modelToEntity(res),
    );
    return new PagingDataResponseDto(data, result.meta);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  async markAsRead(id: string, userId: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException(
        this.i18nService.translate("errors.NOTIFICATION.NOT_FOUND"),
      );
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException(
        this.i18nService.translate("errors.NOTIFICATION.ACCESS_DENIED"),
      );
    }

    const updated = await this.notificationRepository.updateById(id, {
      isRead: true,
    });
    return this.notificationMapper.modelToEntity(updated);
  }

  async markAllAsRead(userId: string): Promise<MessageResponseDto> {
    await this.notificationRepository.markAllAsRead(userId);
    return new SuccessResponseDto(
      this.i18nService.translate("messages.NOTIFICATION.ALL_READ"),
    );
  }

  async remove(id: string, userId: string): Promise<MessageResponseDto> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException(
        this.i18nService.translate("errors.NOTIFICATION.NOT_FOUND"),
      );
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException(
        this.i18nService.translate("errors.NOTIFICATION.ACCESS_DENIED"),
      );
    }

    await this.notificationRepository.deleteById(id);
    return new SuccessResponseDto(
      this.i18nService.translate("messages.NOTIFICATION.DELETED"),
    );
  }
}
