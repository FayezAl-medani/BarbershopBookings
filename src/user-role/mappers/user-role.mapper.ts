import { Injectable } from '@nestjs/common';
import { UserRole, Role } from '@prisma/client';
import { UserRoleEntity } from '../entities/user-role.entity.js';
import { RoleMapper } from '../../role/mappers/role.mapper.js';

@Injectable()
export class UserRoleMapper {
  constructor(private readonly roleMapper: RoleMapper) {}

  modelToEntity(model: UserRole & { role?: Role }): UserRoleEntity {
    return new UserRoleEntity({
      userId: model.userId,
      roleId: model.roleId,
      role: model.role ? this.roleMapper.modelToEntity(model.role) : undefined,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
