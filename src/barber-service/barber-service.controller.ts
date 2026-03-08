import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
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
import { BARBER_SERVICE_SERVICE } from './barber-service.service.interface.js';
import type { IBarberServiceService } from './barber-service.service.interface.js';
import { BarberServiceResponseDto } from './dto/response/barber-service-response.dto.js';
import { DataResponseDto, DataArrayResponseDto } from '../common/dto/data-response.dto.js';
import { ErrorResponseDto, MessageResponseDto } from '../common/dto/status.dto.js';
import { ApiDataArrayResponse, ApiCreatedDataResponse } from '../common/decorators/response.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { RoleName } from '../common/enums/role-name.enum.js';

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth('access-token')
@ApiTags('Barber Service')
@Controller('barber-service')
export class BarberServiceController {
  constructor(
    @Inject(BARBER_SERVICE_SERVICE)
    private readonly barberServiceService: IBarberServiceService,
  ) {}

  @Get('barber/:barberId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all services offered by a barber' })
  @ApiDataArrayResponse(BarberServiceResponseDto)
  async getBarberServices(
    @Param('barberId') barberId: string,
  ): Promise<DataArrayResponseDto<BarberServiceResponseDto>> {
    const services = await this.barberServiceService.getBarberServices(barberId);
    return new DataArrayResponseDto(services);
  }

  @Post(':barberId/:serviceId')
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBER)
  @ApiOperation({ summary: 'Add a service to a barber' })
  @ApiCreatedDataResponse(BarberServiceResponseDto)
  async addService(
    @Param('barberId') barberId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<DataResponseDto<BarberServiceResponseDto>> {
    const result = await this.barberServiceService.addServiceToBarber(barberId, serviceId);
    return new DataResponseDto(result);
  }

  @Delete(':barberId/:serviceId')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBER)
  @ApiOperation({ summary: 'Remove a service from a barber' })
  async removeService(
    @Param('barberId') barberId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<MessageResponseDto> {
    return this.barberServiceService.removeServiceFromBarber(barberId, serviceId);
  }
}
