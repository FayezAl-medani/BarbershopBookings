import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IRoleService } from './role.service.interface.js';
import { RoleRepository } from './role.repository.js';
import { RoleMapper } from './mappers/role.mapper.js';
import { RoleEntity } from './entities/role.entity.js';
import { RoleCreateDto } from './dto/request/role-create.dto.js';

@Injectable()
export class RoleService implements IRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly roleMapper: RoleMapper,
    private readonly i18nService: I18nService,
  ) {}

  async create(payload: RoleCreateDto): Promise<RoleEntity> {
    const exists = await this.roleRepository.existsByName(payload.name);
    if (exists) {
      throw new ConflictException(
        this.i18nService.translate('errors.ROLE.ALREADY_EXISTS'),
      );
    }
    const role = await this.roleRepository.create(payload);
    return this.roleMapper.modelToEntity(role);
  }

  async getById(id: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(
        this.i18nService.translate('errors.ROLE.NOT_FOUND'),
      );
    }
    return this.roleMapper.modelToEntity(role);
  }

  async getByName(name: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findByName(name);
    if (!role) {
      throw new NotFoundException(
        this.i18nService.translate('errors.ROLE.NOT_FOUND'),
      );
    }
    return this.roleMapper.modelToEntity(role);
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.roleRepository.findAll();
    return roles.map((r) => this.roleMapper.modelToEntity(r));
  }
}
