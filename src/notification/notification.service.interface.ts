import { NotificationEntity } from "./entities/notification.entity.js";
import { NotificationFilterDto } from "./dto/request/notification-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { MessageResponseDto } from "../common/dto/status.dto.js";

export const NOTIFICATION_SERVICE = "INotificationService";

export interface INotificationService {
  create(
    userId: string,
    title: string,
    body: string,
    type: string,
    data?: any,
  ): Promise<NotificationEntity>;
  findAllPaging(
    userId: string,
    filter: NotificationFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<NotificationEntity>>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(id: string, userId: string): Promise<NotificationEntity>;
  markAllAsRead(userId: string): Promise<MessageResponseDto>;
  remove(id: string, userId: string): Promise<MessageResponseDto>;
}
