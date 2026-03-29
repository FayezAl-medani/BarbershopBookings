import { Injectable } from "@nestjs/common";
import { Salary } from "@prisma/client";
import { SalaryEntity } from "../entities/salary.entity.js";
import { SalaryResponseDto } from "../dto/response/salary-response.dto.js";

@Injectable()
export class SalaryMapper {
  modelToEntity(model: Salary): SalaryEntity {
    return new SalaryEntity({
      id: model.id,
      barberId: model.barberId,
      type: model.type,
      amount: Number(model.amount),
      currency: model.currency,
      periodStart: model.periodStart,
      periodEnd: model.periodEnd,
      paidAt: model.paidAt,
      isPaid: model.isPaid,
      notes: model.notes,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: SalaryEntity): SalaryResponseDto {
    return {
      id: entity.id,
      barberId: entity.barberId,
      type: entity.type,
      amount: entity.amount,
      currency: entity.currency,
      periodStart: entity.periodStart,
      periodEnd: entity.periodEnd,
      paidAt: entity.paidAt,
      isPaid: entity.isPaid,
      notes: entity.notes,
      createdAt: entity.createdAt,
    };
  }
}
