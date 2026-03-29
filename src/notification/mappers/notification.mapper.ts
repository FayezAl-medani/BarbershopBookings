import { Injectable } from "@nestjs/common";
import { Notification } from "@prisma/client";
import { NotificationEntity } from "../entities/notification.entity.js";
import { NotificationResponseDto } from "../dto/response/notification-response.dto.js";

@Injectable()
export class NotificationMapper {
  modelToEntity(model: Notification): NotificationEntity {
    return new NotificationEntity({
      id: model.id,
      userId: model.userId,
      title: model.title,
      body: model.body,
      type: model.type,
      isRead: model.isRead,
      data: model.data,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: NotificationEntity): NotificationResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      body: entity.body,
      type: entity.type,
      isRead: entity.isRead,
      data: entity.data,
      createdAt: entity.createdAt,
    };
  }
}
