import { Injectable } from "@nestjs/common";
import { Review } from "@prisma/client";
import { ReviewEntity } from "../entities/review.entity.js";
import { ReviewResponseDto } from "../dto/response/review-response.dto.js";

@Injectable()
export class ReviewMapper {
  modelToEntity(model: Review): ReviewEntity {
    return new ReviewEntity({
      id: model.id,
      customerId: model.customerId,
      barbershopId: model.barbershopId,
      barberId: model.barberId,
      bookingId: model.bookingId,
      rating: model.rating,
      comment: model.comment,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: ReviewEntity): ReviewResponseDto {
    return {
      id: entity.id,
      customerId: entity.customerId,
      barbershopId: entity.barbershopId,
      barberId: entity.barberId,
      bookingId: entity.bookingId,
      rating: entity.rating,
      comment: entity.comment,
      createdAt: entity.createdAt,
    };
  }
}
