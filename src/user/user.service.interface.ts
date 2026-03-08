import { UserEntity } from './entities/user.entity.js';
import { UserCreateDto } from './dto/request/user-create.dto.js';
import { UserFilterDto } from './dto/request/user-filter.dto.js';
import { UserPatchDto } from './dto/request/user-patch.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { SortingParam } from '../common/decorators/sorting-params.decorator.js';
import { IPaginatedResult } from '../common/dto/paging-data-response.dto.js';
import { UserIncludePreset } from './enums/user-include-preset.enum.js';
import { Prisma } from '@prisma/client';
import { MessageResponseDto } from '../common/dto/status.dto.js';

export const USER_SERVICE = 'IUserService';

export interface IUserService {
  create(payload: UserCreateDto, include?: UserIncludePreset | Prisma.UserInclude): Promise<UserEntity>;
  findAllPaging(
    filter: UserFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
    include?: UserIncludePreset | Prisma.UserInclude,
  ): Promise<IPaginatedResult<UserEntity>>;
  getById(id: string, include?: UserIncludePreset | Prisma.UserInclude): Promise<UserEntity>;
  getByPhoneNumber(phoneNumber: string, include?: UserIncludePreset | Prisma.UserInclude): Promise<UserEntity>;
  update(id: string, payload: UserPatchDto, include?: UserIncludePreset | Prisma.UserInclude): Promise<UserEntity>;
  remove(id: string): Promise<MessageResponseDto>;
}
