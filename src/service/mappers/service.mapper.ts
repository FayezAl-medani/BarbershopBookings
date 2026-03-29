import { Injectable } from "@nestjs/common";
import { Service } from "@prisma/client";
import { ServiceEntity } from "../entities/service.entity.js";
import { ServiceResponseDto } from "../dto/response/service-response.dto.js";

@Injectable()
export class ServiceMapper {
  modelToEntity(model: Service): ServiceEntity {
    return new ServiceEntity({
      id: model.id,
      barbershopId: model.barbershopId,
      name: model.name,
      description: model.description,
      duration: model.duration,
      price: Number(model.price),
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: ServiceEntity): ServiceResponseDto {
    return {
      id: entity.id,
      barbershopId: entity.barbershopId,
      name: entity.name,
      description: entity.description,
      duration: entity.duration,
      price: entity.price,
      isActive: entity.isActive,
    };
  }
}
