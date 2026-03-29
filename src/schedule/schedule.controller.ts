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
import { SCHEDULE_SERVICE } from "./schedule.service.interface.js";
import type { IScheduleService } from "./schedule.service.interface.js";
import { ScheduleCreateDto } from "./dto/request/schedule-create.dto.js";
import { ScheduleFilterDto } from "./dto/request/schedule-filter.dto.js";
import { SchedulePatchDto } from "./dto/request/schedule-patch.dto.js";
import { ScheduleResponseDto } from "./dto/response/schedule-response.dto.js";
import {
  DataResponseDto,
  DataArrayResponseDto,
} from "../common/dto/data-response.dto.js";
import {
  ErrorResponseDto,
  MessageResponseDto,
} from "../common/dto/status.dto.js";
import {
  ApiDataResponse,
  ApiDataArrayResponse,
  ApiCreatedDataResponse,
  ApiMessageResponse,
} from "../common/decorators/response.decorator.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { Public } from "../common/decorators/public.decorator.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { JwtPayloadWithAuth } from "../common/entities/index.js";
import { ScheduleMapper } from "./mappers/schedule.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Schedule")
@Controller("schedule")
export class ScheduleController {
  constructor(
    @Inject(SCHEDULE_SERVICE)
    private readonly scheduleService: IScheduleService,
    private readonly scheduleMapper: ScheduleMapper,
  ) {}

  /** Verify the schedule belongs to the calling barber */
  private async assertScheduleOwnership(
    scheduleId: string,
    user: JwtPayloadWithAuth,
  ): Promise<void> {
    if (user.loggedInAs !== RoleName.BARBER) return;
    const schedule = await this.scheduleService.getById(scheduleId);
    if (schedule.barberId !== user.barberId) {
      throw new ForbiddenException("You can only manage your own schedules");
    }
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all schedules (filterable by barberId, dayOfWeek)",
  })
  @ApiDataArrayResponse(ScheduleResponseDto)
  async findAll(
    @Query() filter: ScheduleFilterDto,
  ): Promise<DataArrayResponseDto<ScheduleResponseDto>> {
    const schedules = await this.scheduleService.findAll(filter);
    const mapped = schedules.map((s) =>
      this.scheduleMapper.entityToResponseDto(s),
    );
    return new DataArrayResponseDto(mapped);
  }

  @Get("barber/:barberId")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all schedules for a barber" })
  @ApiDataArrayResponse(ScheduleResponseDto)
  async findByBarberId(
    @Param("barberId") barberId: string,
  ): Promise<DataArrayResponseDto<ScheduleResponseDto>> {
    const schedules = await this.scheduleService.findAllByBarberId(barberId);
    const mapped = schedules.map((s) =>
      this.scheduleMapper.entityToResponseDto(s),
    );
    return new DataArrayResponseDto(mapped);
  }

  @Get(":id")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get schedule by ID" })
  @ApiDataResponse(ScheduleResponseDto)
  async findOne(
    @Param("id") id: string,
  ): Promise<DataResponseDto<ScheduleResponseDto>> {
    const schedule = await this.scheduleService.getById(id);
    return new DataResponseDto(
      this.scheduleMapper.entityToResponseDto(schedule),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBER)
  @ApiOperation({ summary: "Create a new schedule" })
  @ApiCreatedDataResponse(ScheduleResponseDto)
  async create(
    @Body() payload: ScheduleCreateDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<ScheduleResponseDto>> {
    // Barbers can only create schedules for themselves
    if (user.loggedInAs === RoleName.BARBER) {
      payload.barberId = user.barberId!;
    }
    const schedule = await this.scheduleService.create(payload);
    return new DataResponseDto(
      this.scheduleMapper.entityToResponseDto(schedule),
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBER)
  @ApiOperation({ summary: "Update a schedule" })
  @ApiDataResponse(ScheduleResponseDto)
  async update(
    @Param("id") id: string,
    @Body() payload: SchedulePatchDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<ScheduleResponseDto>> {
    await this.assertScheduleOwnership(id, user);
    const schedule = await this.scheduleService.update(id, payload);
    return new DataResponseDto(
      this.scheduleMapper.entityToResponseDto(schedule),
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.BARBER)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Delete a schedule" })
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<MessageResponseDto> {
    await this.assertScheduleOwnership(id, user);
    return this.scheduleService.remove(id);
  }
}
