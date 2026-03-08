import {
  Controller,
  Post,
  Body,
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
import { ADMIN_SERVICE } from './admin.service.interface.js';
import type { IAdminService } from './admin.service.interface.js';
import { AdminRegisterDto } from './dto/request/admin-register.dto.js';
import { AdminResponseDto } from './dto/response/admin-response.dto.js';
import { DataResponseDto } from '../common/dto/data-response.dto.js';
import { ErrorResponseDto } from '../common/dto/status.dto.js';
import { ApiCreatedDataResponse } from '../common/decorators/response.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RoleName } from '../common/enums/role-name.enum.js';
import { AdminMapper } from './mappers/admin.mapper.js';

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth('access-token')
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    @Inject(ADMIN_SERVICE)
    private readonly adminService: IAdminService,
    private readonly adminMapper: AdminMapper,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Register a new admin user' })
  @ApiCreatedDataResponse(AdminResponseDto)
  async registerAdmin(
    @Body() payload: AdminRegisterDto,
  ): Promise<DataResponseDto<AdminResponseDto>> {
    const admin = await this.adminService.registerAdminUser(payload);
    return new DataResponseDto(this.adminMapper.entityToResponseDto(admin));
  }
}
