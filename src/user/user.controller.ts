import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { USER_SERVICE } from './user.service.interface.js';
import type { IUserService } from './user.service.interface.js';
import { UserCreateDto } from './dto/request/user-create.dto.js';
import { UserFilterDto } from './dto/request/user-filter.dto.js';
import { UserPatchDto } from './dto/request/user-patch.dto.js';
import { UserResponseDto } from './dto/response/user-response.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { DataResponseDto } from '../common/dto/data-response.dto.js';
import { PagingDataResponseDto } from '../common/dto/paging-data-response.dto.js';
import { ErrorResponseDto, MessageResponseDto } from '../common/dto/status.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtPayloadWithAuth } from '../common/entities/jwt-decoded.entity.js';
import { SortingParams, SortingParam } from '../common/decorators/sorting-params.decorator.js';
import { ApiSortingQuery } from '../common/decorators/sorting-params-swagger.decorator.js';
import { ApiDataResponse, ApiPaginatedResponse, ApiCreatedDataResponse } from '../common/decorators/response.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RoleName } from '../common/enums/role-name.enum.js';
import { UserMapper } from './mappers/user.mapper.js';

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth('access-token')
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    private readonly userMapper: UserMapper,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiDataResponse(UserResponseDto)
  async getMyProfile(
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<UserResponseDto>> {
    const profile = await this.userService.getById(user.userId);
    return new DataResponseDto(this.userMapper.entityToResponseDto(profile));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiSortingQuery(['firstName', 'createdAt', 'status'])
  async findAll(
    @Query() filter: UserFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(['firstName', 'createdAt', 'status']) sort: SortingParam | null,
  ): Promise<PagingDataResponseDto<UserResponseDto>> {
    const result = await this.userService.findAllPaging(filter, pagingArgs, sort);
    const mappedData = result.data.map((entity) => this.userMapper.entityToResponseDto(entity));
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiDataResponse(UserResponseDto)
  async findOne(@Param('id') id: string): Promise<DataResponseDto<UserResponseDto>> {
    const user = await this.userService.getById(id);
    return new DataResponseDto(this.userMapper.entityToResponseDto(user));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedDataResponse(UserResponseDto)
  async create(@Body() payload: UserCreateDto): Promise<DataResponseDto<UserResponseDto>> {
    const user = await this.userService.create(payload);
    return new DataResponseDto(this.userMapper.entityToResponseDto(user));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a user' })
  @ApiDataResponse(UserResponseDto)
  async update(
    @Param('id') id: string,
    @Body() payload: UserPatchDto,
  ): Promise<DataResponseDto<UserResponseDto>> {
    const user = await this.userService.update(id, payload);
    return new DataResponseDto(this.userMapper.entityToResponseDto(user));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a user' })
  async remove(@Param('id') id: string): Promise<MessageResponseDto> {
    return this.userService.remove(id);
  }
}
