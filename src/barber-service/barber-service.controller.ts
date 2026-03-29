import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
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
import { BARBER_SERVICE_SERVICE } from "./barber-service.service.interface.js";
import type { IBarberServiceService } from "./barber-service.service.interface.js";
import { BarberServiceResponseDto } from "./dto/response/barber-service-response.dto.js";
import {
  DataResponseDto,
  DataArrayResponseDto,
} from "../common/dto/data-response.dto.js";
import {
  ErrorResponseDto,
  MessageResponseDto,
} from "../common/dto/status.dto.js";
import {
  ApiDataArrayResponse,
  ApiCreatedDataResponse,
  ApiMessageResponse,
} from "../common/decorators/response.decorator.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { Public } from "../common/decorators/public.decorator.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { JwtPayloadWithAuth } from "../common/entities/index.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Barber Service")
@Controller("barber-service")
export class BarberServiceController {
  constructor(
    @Inject(BARBER_SERVICE_SERVICE)
    private readonly barberServiceService: IBarberServiceService,
  ) {}

  @Get("barber/:barberId")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all services offered by a barber" })
  @ApiDataArrayResponse(BarberServiceResponseDto)
  async getBarberServices(
    @Param("barberId") barberId: string,
  ): Promise<DataArrayResponseDto<BarberServiceResponseDto>> {
    const services =
      await this.barberServiceService.getBarberServices(barberId);
    return new DataArrayResponseDto(services);
  }

  /** Verify BARBER can only manage their own services */
  private assertBarberSelf(barberId: string, user: JwtPayloadWithAuth): void {
    if (user.loggedInAs !== RoleName.BARBER) return;
    if (barberId !== user.barberId) {
      throw new ForbiddenException("You can only manage your own services");
    }
  }

  @Post(":barberId/:serviceId")
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBER)
  @ApiOperation({ summary: "Add a service to a barber" })
  @ApiCreatedDataResponse(BarberServiceResponseDto)
  async addService(
    @Param("barberId") barberId: string,
    @Param("serviceId") serviceId: string,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<BarberServiceResponseDto>> {
    this.assertBarberSelf(barberId, user);
    const result = await this.barberServiceService.addServiceToBarber(
      barberId,
      serviceId,
    );
    return new DataResponseDto(result);
  }

  @Delete(":barberId/:serviceId")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBER)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Remove a service from a barber" })
  async removeService(
    @Param("barberId") barberId: string,
    @Param("serviceId") serviceId: string,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<MessageResponseDto> {
    this.assertBarberSelf(barberId, user);
    return this.barberServiceService.removeServiceFromBarber(
      barberId,
      serviceId,
    );
  }
}
