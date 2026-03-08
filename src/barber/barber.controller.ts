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
import { BARBER_SERVICE } from './barber.service.interface.js';
import type { IBarberService } from './barber.service.interface.js';
import { BarberCreateDto } from './dto/request/barber-create.dto.js';
import { BarberFilterDto } from './dto/request/barber-filter.dto.js';
import { BarberPatchDto } from './dto/request/barber-patch.dto.js';
import { BarberResponseDto } from './dto/response/barber-response.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { DataResponseDto } from '../common/dto/data-response.dto.js';
import { PagingDataResponseDto } from '../common/dto/paging-data-response.dto.js';
import { ErrorResponseDto, MessageResponseDto } from '../common/dto/status.dto.js';
import { SortingParams, SortingParam } from '../common/decorators/sorting-params.decorator.js';
import { ApiSortingQuery } from '../common/decorators/sorting-params-swagger.decorator.js';
import { ApiDataResponse, ApiPaginatedResponse, ApiCreatedDataResponse } from '../common/decorators/response.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { RoleName } from '../common/enums/role-name.enum.js';
import { BarberMapper } from './mappers/barber.mapper.js';

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth('access-token')
@ApiTags('Barber')
@Controller('barber')
export class BarberController {
  constructor(
    @Inject(BARBER_SERVICE)
    private readonly barberService: IBarberService,
    private readonly barberMapper: BarberMapper,
  ) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all barbers with pagination' })
  @ApiPaginatedResponse(BarberResponseDto)
  @ApiSortingQuery(['createdAt', 'specialization'])
  async findAll(
    @Query() filter: BarberFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(['createdAt', 'specialization']) sort: SortingParam | null,
  ): Promise<PagingDataResponseDto<BarberResponseDto>> {
    const result = await this.barberService.findAllPaging(filter, pagingArgs, sort);
    const mappedData = result.data.map((entity) => this.barberMapper.entityToResponseDto(entity));
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get barber by ID' })
  @ApiDataResponse(BarberResponseDto)
  async findOne(@Param('id') id: string): Promise<DataResponseDto<BarberResponseDto>> {
    const barber = await this.barberService.getById(id);
    return new DataResponseDto(this.barberMapper.entityToResponseDto(barber));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new barber' })
  @ApiCreatedDataResponse(BarberResponseDto)
  async create(@Body() payload: BarberCreateDto): Promise<DataResponseDto<BarberResponseDto>> {
    const barber = await this.barberService.create(payload);
    return new DataResponseDto(this.barberMapper.entityToResponseDto(barber));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a barber' })
  @ApiDataResponse(BarberResponseDto)
  async update(
    @Param('id') id: string,
    @Body() payload: BarberPatchDto,
  ): Promise<DataResponseDto<BarberResponseDto>> {
    const barber = await this.barberService.update(id, payload);
    return new DataResponseDto(this.barberMapper.entityToResponseDto(barber));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a barber' })
  async remove(@Param('id') id: string): Promise<MessageResponseDto> {
    return this.barberService.remove(id);
  }
}
