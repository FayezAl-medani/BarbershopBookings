import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Inject,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { NOTIFICATION_SERVICE } from "./notification.service.interface.js";
import type { INotificationService } from "./notification.service.interface.js";
import { NotificationFilterDto } from "./dto/request/notification-filter.dto.js";
import { NotificationResponseDto } from "./dto/response/notification-response.dto.js";
import { UnreadCountResponseDto } from "./dto/response/unread-count-response.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { DataResponseDto } from "../common/dto/data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import {
  ErrorResponseDto,
  MessageResponseDto,
} from "../common/dto/status.dto.js";
import {
  SortingParams,
  SortingParam,
} from "../common/decorators/sorting-params.decorator.js";
import { ApiSortingQuery } from "../common/decorators/sorting-params-swagger.decorator.js";
import {
  ApiDataResponse,
  ApiPaginatedResponse,
  ApiMessageResponse,
} from "../common/decorators/response.decorator.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { NotificationMapper } from "./mappers/notification.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Notification")
@Controller("notification")
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
    private readonly notificationMapper: NotificationMapper,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get current user notifications" })
  @ApiPaginatedResponse(NotificationResponseDto)
  @ApiSortingQuery(["createdAt", "type"])
  async findAll(
    @CurrentUser("userId") userId: string,
    @Query() filter: NotificationFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(["createdAt", "type"]) sort: SortingParam | null,
  ): Promise<PagingDataResponseDto<NotificationResponseDto>> {
    const result = await this.notificationService.findAllPaging(
      userId,
      filter,
      pagingArgs,
      sort,
    );
    const mappedData = result.data.map((entity) =>
      this.notificationMapper.entityToResponseDto(entity),
    );
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get("unread-count")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get unread notification count" })
  @ApiDataResponse(UnreadCountResponseDto)
  async getUnreadCount(
    @CurrentUser("userId") userId: string,
  ): Promise<DataResponseDto<UnreadCountResponseDto>> {
    const count = await this.notificationService.getUnreadCount(userId);
    return new DataResponseDto({ count });
  }

  @Patch(":id/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark notification as read" })
  @ApiDataResponse(NotificationResponseDto)
  async markAsRead(
    @Param("id") id: string,
    @CurrentUser("userId") userId: string,
  ): Promise<DataResponseDto<NotificationResponseDto>> {
    const notification = await this.notificationService.markAsRead(id, userId);
    return new DataResponseDto(
      this.notificationMapper.entityToResponseDto(notification),
    );
  }

  @Patch("read-all")
  @HttpCode(HttpStatus.OK)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Mark all notifications as read" })
  async markAllAsRead(
    @CurrentUser("userId") userId: string,
  ): Promise<MessageResponseDto> {
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Delete a notification" })
  async remove(
    @Param("id") id: string,
    @CurrentUser("userId") userId: string,
  ): Promise<MessageResponseDto> {
    return this.notificationService.remove(id, userId);
  }
}
