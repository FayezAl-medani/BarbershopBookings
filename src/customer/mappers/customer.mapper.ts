import { Injectable } from "@nestjs/common";
import { Customer, User } from "@prisma/client";
import { CustomerEntity } from "../entities/customer.entity.js";
import { UserMapper } from "../../user/mappers/user.mapper.js";
import { CustomerResponseDto } from "../dto/response/customer-response.dto.js";

@Injectable()
export class CustomerMapper {
  constructor(private readonly userMapper: UserMapper) {}

  modelToEntity(model: Customer & { user?: User }): CustomerEntity {
    return new CustomerEntity({
      id: model.id,
      userId: model.userId,
      notes: model.notes,
      user: model.user ? this.userMapper.modelToEntity(model.user) : undefined,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: CustomerEntity): CustomerResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      notes: entity.notes,
      user: entity.user
        ? this.userMapper.entityToResponseDto(entity.user)
        : undefined,
    };
  }
}
