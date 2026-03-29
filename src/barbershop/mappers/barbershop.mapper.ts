import { Injectable } from "@nestjs/common";
import { Barbershop } from "@prisma/client";
import { BarbershopEntity } from "../entities/barbershop.entity.js";
import { BarbershopResponseDto } from "../dto/response/barbershop-response.dto.js";

@Injectable()
export class BarbershopMapper {
  modelToEntity(
    model: Barbershop & { _count?: { reviews: number }; avgRating?: number },
  ): BarbershopEntity {
    return new BarbershopEntity({
      id: model.id,
      name: model.name,
      description: model.description,
      address: model.address,
      city: model.city,
      latitude: Number(model.latitude),
      longitude: Number(model.longitude),
      coverImageUrl: model.coverImageUrl,
      phone: model.phone,
      isActive: model.isActive,
      ownerId: model.ownerId,
      avgRating: (model as any).avgRating ?? null,
      reviewCount: model._count?.reviews ?? null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: BarbershopEntity): BarbershopResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      address: entity.address,
      city: entity.city,
      latitude: entity.latitude,
      longitude: entity.longitude,
      coverImageUrl: entity.coverImageUrl,
      phone: entity.phone,
      isActive: entity.isActive,
      ownerId: entity.ownerId,
      avgRating: entity.avgRating,
      reviewCount: entity.reviewCount,
    };
  }
}
