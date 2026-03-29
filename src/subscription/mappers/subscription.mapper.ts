import { Injectable } from "@nestjs/common";
import { Subscription } from "@prisma/client";
import { SubscriptionEntity } from "../entities/subscription.entity.js";
import { SubscriptionResponseDto } from "../dto/response/subscription-response.dto.js";

@Injectable()
export class SubscriptionMapper {
  modelToEntity(model: Subscription): SubscriptionEntity {
    return new SubscriptionEntity({
      id: model.id,
      barbershopId: model.barbershopId,
      planName: model.planName,
      amount: Number(model.amount),
      currency: model.currency,
      status: model.status,
      startDate: model.startDate,
      endDate: model.endDate,
      autoRenew: model.autoRenew,
      notes: model.notes,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: SubscriptionEntity): SubscriptionResponseDto {
    return {
      id: entity.id,
      barbershopId: entity.barbershopId,
      planName: entity.planName,
      amount: entity.amount,
      currency: entity.currency,
      status: entity.status,
      startDate: entity.startDate,
      endDate: entity.endDate,
      autoRenew: entity.autoRenew,
      notes: entity.notes,
      createdAt: entity.createdAt,
    };
  }
}
