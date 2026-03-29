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
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { BARBERSHOP_SERVICE } from "./barbershop.service.interface.js";
import type { IBarbershopService } from "./barbershop.service.interface.js";
import { BarbershopCreateDto } from "./dto/request/barbershop-create.dto.js";
import { BarbershopFilterDto } from "./dto/request/barbershop-filter.dto.js";
import { BarbershopPatchDto } from "./dto/request/barbershop-patch.dto.js";
import { BarbershopResponseDto } from "./dto/response/barbershop-response.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { DataResponseDto } from "../common/dto/data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import {
  ErrorResponseDto,
  MessageResponseDto,
} from "../common/dto/status.dto.js";
import {
  SortingParams,
  SortingParam,
} from "../common/decorators/sorting-params.decorator.js";
import { ApiSortingQuery } from "../common/decorators/sorting-params-swagger.decorator.js";
import {
  ApiDataResponse,
  ApiPaginatedResponse,
  ApiCreatedDataResponse,
  ApiMessageResponse,
} from "../common/decorators/response.decorator.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { Public } from "../common/decorators/public.decorator.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { JwtPayloadWithAuth } from "../common/entities/index.js";
import { BarbershopMapper } from "./mappers/barbershop.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Barbershop")
@Controller("barbershop")
export class BarbershopController {
  constructor(
    @Inject(BARBERSHOP_SERVICE)
    private readonly barbershopService: IBarbershopService,
    private readonly barbershopMapper: BarbershopMapper,
  ) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all barbershops with pagination" })
  @ApiPaginatedResponse(BarbershopResponseDto)
  @ApiSortingQuery(["name", "city", "createdAt"])
  async findAll(
    @Query() filter: BarbershopFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(["name", "city", "createdAt"]) sort: SortingParam | null,
  ): Promise<PagingDataResponseDto<BarbershopResponseDto>> {
    const result = await this.barbershopService.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const mappedData = result.data.map((entity) =>
      this.barbershopMapper.entityToResponseDto(entity),
    );
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get(":id")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get barbershop by ID with details" })
  @ApiDataResponse(BarbershopResponseDto)
  async findOne(
    @Param("id") id: string,
  ): Promise<DataResponseDto<BarbershopResponseDto>> {
    const barbershop = await this.barbershopService.getById(id);
    return new DataResponseDto(
      this.barbershopMapper.entityToResponseDto(barbershop),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Create a new barbershop" })
  @ApiCreatedDataResponse(BarbershopResponseDto)
  async create(
    @Body() payload: BarbershopCreateDto,
  ): Promise<DataResponseDto<BarbershopResponseDto>> {
    const barbershop = await this.barbershopService.create(payload);
    return new DataResponseDto(
      this.barbershopMapper.entityToResponseDto(barbershop),
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.BARBERSHOP_OWNER)
  @ApiOperation({ summary: "Update a barbershop" })
  @ApiDataResponse(BarbershopResponseDto)
  async update(
    @Param("id") id: string,
    @Body() payload: BarbershopPatchDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<BarbershopResponseDto>> {
    // BARBERSHOP_OWNER can only update their own barbershop
    if (
      user.loggedInAs === RoleName.BARBERSHOP_OWNER &&
      id !== user.barbershopId
    ) {
      throw new ForbiddenException("You can only update your own barbershop");
    }
    const barbershop = await this.barbershopService.update(id, payload);
    return new DataResponseDto(
      this.barbershopMapper.entityToResponseDto(barbershop),
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Delete a barbershop" })
  async remove(@Param("id") id: string): Promise<MessageResponseDto> {
    return this.barbershopService.remove(id);
  }
}
