import { PartialType, OmitType } from "@nestjs/swagger";
import { ScheduleCreateDto } from "./schedule-create.dto.js";

export class SchedulePatchDto extends PartialType(
  OmitType(ScheduleCreateDto, ["barberId", "dayOfWeek"] as const),
) {}
