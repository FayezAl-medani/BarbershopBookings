import { Injectable } from "@nestjs/common";
import { Payment } from "@prisma/client";
import { PaymentEntity } from "../entities/payment.entity.js";
import { PaymentResponseDto } from "../dto/response/payment-response.dto.js";

@Injectable()
export class PaymentMapper {
  modelToEntity(model: Payment): PaymentEntity {
    return new PaymentEntity({
      id: model.id,
      bookingId: model.bookingId,
      amount: Number(model.amount),
      type: model.type,
      method: model.method,
      status: model.status,
      gatewayRef: model.gatewayRef,
      failureReason: model.failureReason,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: PaymentEntity): PaymentResponseDto {
    return {
      id: entity.id,
      bookingId: entity.bookingId,
      amount: entity.amount,
      type: entity.type,
      method: entity.method,
      status: entity.status,
      gatewayRef: entity.gatewayRef,
      failureReason: entity.failureReason,
      createdAt: entity.createdAt,
    };
  }
}
