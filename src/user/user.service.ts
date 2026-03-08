import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Prisma } from '@prisma/client';
import { IUserService } from './user.service.interface.js';
import { UserRepository } from './user.repository.js';
import { UserMapper } from './mappers/user.mapper.js';
import { UserEntity } from './entities/user.entity.js';
import { UserCreateDto } from './dto/request/user-create.dto.js';
import { UserFilterDto } from './dto/request/user-filter.dto.js';
import { UserPatchDto } from './dto/request/user-patch.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { SortingParam } from '../common/decorators/sorting-params.decorator.js';
import { IPaginatedResult } from '../common/dto/paging-data-response.dto.js';
import { PagingDataResponseDto } from '../common/dto/paging-data-response.dto.js';
import { MessageResponseDto, SuccessResponseDto } from '../common/dto/status.dto.js';
import { UserIncludePreset } from './enums/user-include-preset.enum.js';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly i18nService: I18nService,
  ) {}

  async create(
    payload: UserCreateDto,
    include?: UserIncludePreset | Prisma.UserInclude,
  ): Promise<UserEntity> {
    const exist = await this.userRepository.existsByPhoneNumber(payload.phoneNumber);
    if (exist) {
      throw new ConflictException(
        this.i18nService.translate('errors.USER.ALREADY_EXISTS_WITH_PHONE_NUMBER'),
      );
    }
    const created = await this.userRepository.create(payload, include);
    return this.userMapper.modelToEntity(created);
  }

  async findAllPaging(
    filter: UserFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
    include?: UserIncludePreset | Prisma.UserInclude,
  ): Promise<IPaginatedResult<UserEntity>> {
    const result = await this.userRepository.findAllPaging(filter, pagingArgs, sort, include);
    const data = result.data.map((res) => this.userMapper.modelToEntity(res));
    return new PagingDataResponseDto(data, result.meta);
  }

  async getById(
    id: string,
    include?: UserIncludePreset | Prisma.UserInclude,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findById(id, include);
    if (!user) {
      throw new NotFoundException(
        this.i18nService.translate('errors.USER.NOT_FOUND'),
      );
    }
    return this.userMapper.modelToEntity(user);
  }

  async getByPhoneNumber(
    phoneNumber: string,
    include?: UserIncludePreset | Prisma.UserInclude,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findByPhoneNumber(phoneNumber, include);
    if (!user) {
      throw new NotFoundException(
        this.i18nService.translate('errors.USER.NOT_FOUND'),
      );
    }
    return this.userMapper.modelToEntity(user);
  }

  async update(
    id: string,
    payload: UserPatchDto,
    include?: UserIncludePreset | Prisma.UserInclude,
  ): Promise<UserEntity> {
    await this.getById(id);
    const updated = await this.userRepository.updateById(id, payload, include);
    return this.userMapper.modelToEntity(updated);
  }

  async remove(id: string): Promise<MessageResponseDto> {
    await this.getById(id);
    await this.userRepository.deleteById(id);
    return new SuccessResponseDto(
      this.i18nService.translate('messages.USER.DELETED'),
    );
  }
}
