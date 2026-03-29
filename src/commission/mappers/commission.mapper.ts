import { Injectable } from "@nestjs/common";
import { Commission } from "@prisma/client";
import { CommissionEntity } from "../entities/commission.entity.js";
import { CommissionResponseDto } from "../dto/response/commission-response.dto.js";

@Injectable()
export class CommissionMapper {
  modelToEntity(model: Commission): CommissionEntity {
    return new CommissionEntity({
      id: model.id,
      barberId: model.barberId,
      bookingId: model.bookingId,
      amount: Number(model.amount),
      commissionRate: Number(model.commissionRate),
      status: model.status,
      collectedAt: model.collectedAt,
      collectedById: model.collectedById,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: CommissionEntity): CommissionResponseDto {
    return {
      id: entity.id,
      barberId: entity.barberId,
      bookingId: entity.bookingId,
      amount: entity.amount,
      commissionRate: entity.commissionRate,
      status: entity.status,
      collectedAt: entity.collectedAt,
      collectedById: entity.collectedById,
      createdAt: entity.createdAt,
    };
  }
}
