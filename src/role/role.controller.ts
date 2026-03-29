import { Controller, Get, Inject, HttpCode, HttpStatus } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { ROLE_SERVICE } from "./role.service.interface.js";
import type { IRoleService } from "./role.service.interface.js";
import { RoleResponseDto } from "./dto/response/role-response.dto.js";
import { DataArrayResponseDto } from "../common/dto/data-response.dto.js";
import { ErrorResponseDto } from "../common/dto/status.dto.js";
import { ApiDataArrayResponse } from "../common/decorators/response.decorator.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { RoleMapper } from "./mappers/role.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Role")
@Controller("role")
export class RoleController {
  constructor(
    @Inject(ROLE_SERVICE)
    private readonly roleService: IRoleService,
    private readonly roleMapper: RoleMapper,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Get all roles" })
  @ApiDataArrayResponse(RoleResponseDto)
  async findAll(): Promise<DataArrayResponseDto<RoleResponseDto>> {
    const roles = await this.roleService.findAll();
    const mapped = roles.map((r) => this.roleMapper.entityToResponseDto(r));
    return new DataArrayResponseDto(mapped);
  }
}
