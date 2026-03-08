import { Injectable } from '@nestjs/common';
import { Admin, User } from '@prisma/client';
import { AdminEntity } from '../entities/admin.entity.js';
import { UserMapper } from '../../user/mappers/user.mapper.js';
import { AdminResponseDto } from '../dto/response/admin-response.dto.js';

@Injectable()
export class AdminMapper {
  constructor(private readonly userMapper: UserMapper) {}

  modelToEntity(model: Admin & { user?: User }): AdminEntity {
    return new AdminEntity({
      id: model.id,
      userId: model.userId,
      email: model.email,
      user: model.user ? this.userMapper.modelToEntity(model.user) : undefined,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: AdminEntity): AdminResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      email: entity.email,
      user: entity.user ? this.userMapper.entityToResponseDto(entity.user) : undefined,
    };
  }
}
