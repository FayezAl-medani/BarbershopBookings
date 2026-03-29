import { Module } from "@nestjs/common";
import { SubscriptionController } from "./subscription.controller.js";
import { SubscriptionService } from "./subscription.service.js";
import { SubscriptionRepository } from "./subscription.repository.js";
import { SubscriptionMapper } from "./mappers/subscription.mapper.js";
import { SUBSCRIPTION_SERVICE } from "./subscription.service.interface.js";

@Module({
  controllers: [SubscriptionController],
  providers: [
    SubscriptionRepository,
    SubscriptionMapper,
    {
      provide: SUBSCRIPTION_SERVICE,
      useClass: SubscriptionService,
    },
  ],
  exports: [SUBSCRIPTION_SERVICE, SubscriptionRepository, SubscriptionMapper],
})
export class SubscriptionModule {}
