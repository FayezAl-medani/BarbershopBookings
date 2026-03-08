import { Injectable } from '@nestjs/common';
import { IUserRoleService } from './user-role.service.interface.js';
import { UserRoleRepository } from './user-role.repository.js';
import { UserRoleMapper } from './mappers/user-role.mapper.js';
import { UserRoleEntity } from './entities/user-role.entity.js';
import { UserRoleCreateDto } from './dto/request/user-role-create.dto.js';

@Injectable()
export class UserRoleService implements IUserRoleService {
  constructor(
    private readonly userRoleRepository: UserRoleRepository,
    private readonly userRoleMapper: UserRoleMapper,
  ) {}

  async create(payload: UserRoleCreateDto): Promise<UserRoleEntity> {
    const userRole = await this.userRoleRepository.create(payload);
    return this.userRoleMapper.modelToEntity(userRole);
  }

  async findAllByUserId(userId: string): Promise<UserRoleEntity[]> {
    const userRoles = await this.userRoleRepository.findAllByUserId(userId);
    return userRoles.map((ur) => this.userRoleMapper.modelToEntity(ur));
  }

  async existByUserIdAndRoleId(userId: string, roleId: string): Promise<boolean> {
    return this.userRoleRepository.existByUserIdAndRoleId(userId, roleId);
  }
}
