import { Injectable } from '@nestjs/common';
import { Barber, User } from '@prisma/client';
import { BarberEntity } from '../entities/barber.entity.js';
import { UserMapper } from '../../user/mappers/user.mapper.js';
import { BarberResponseDto } from '../dto/response/barber-response.dto.js';

@Injectable()
export class BarberMapper {
  constructor(private readonly userMapper: UserMapper) {}

  modelToEntity(model: Barber & { user?: User }): BarberEntity {
    return new BarberEntity({
      id: model.id,
      userId: model.userId,
      bio: model.bio,
      specialization: model.specialization,
      isActive: model.isActive,
      user: model.user ? this.userMapper.modelToEntity(model.user) : undefined,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  entityToResponseDto(entity: BarberEntity): BarberResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      bio: entity.bio,
      specialization: entity.specialization,
      isActive: entity.isActive,
      user: entity.user ? this.userMapper.entityToResponseDto(entity.user) : undefined,
    };
  }
}
