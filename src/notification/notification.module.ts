import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller.js";
import { NotificationService } from "./notification.service.js";
import { NotificationRepository } from "./notification.repository.js";
import { NotificationMapper } from "./mappers/notification.mapper.js";
import { NOTIFICATION_SERVICE } from "./notification.service.interface.js";

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationRepository,
    NotificationMapper,
    {
      provide: NOTIFICATION_SERVICE,
      useClass: NotificationService,
    },
  ],
  exports: [NOTIFICATION_SERVICE, NotificationRepository, NotificationMapper],
})
export class NotificationModule {}
