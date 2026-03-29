import { Injectable } from "@nestjs/common";
import { Booking } from "@prisma/client";
import { BookingEntity } from "../entities/booking.entity.js";
import { BookingResponseDto } from "../dto/response/booking-response.dto.js";

@Injectable()
export class BookingMapper {
  modelToEntity(model: Booking): BookingEntity {
    return new BookingEntity({
      id: model.id,
      customerId: model.customerId,
      barberId: model.barberId,
      serviceId: model.serviceId,
      date: model.date,
      startTime: model.startTime,
      endTime: model.endTime,
      status: model.status,
      totalPrice: Number(model.totalPrice),
      paymentStatus: model.paymentStatus,
      paymentMethod: model.paymentMethod,
      notes: model.notes,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: BookingEntity): BookingResponseDto {
    return {
      id: entity.id,
      customerId: entity.customerId,
      barberId: entity.barberId,
      serviceId: entity.serviceId,
      date: entity.date,
      startTime: entity.startTime,
      endTime: entity.endTime,
      status: entity.status,
      totalPrice: entity.totalPrice,
      paymentStatus: entity.paymentStatus,
      paymentMethod: entity.paymentMethod,
      notes: entity.notes,
    };
  }
}
