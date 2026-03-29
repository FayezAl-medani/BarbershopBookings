import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { UserEntity } from "../entities/user.entity.js";
import { UserResponseDto } from "../dto/response/user-response.dto.js";

@Injectable()
export class UserMapper {
  modelToEntity(model: User): UserEntity {
    return new UserEntity({
      id: model.id,
      firstName: model.firstName,
      lastName: model.lastName,
      phoneNumber: model.phoneNumber,
      email: model.email,
      status: model.status,
      lastLoginAt: model.lastLoginAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      phoneNumber: entity.phoneNumber,
      email: entity.email,
      status: entity.status,
    };
  }
}
