import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

@ValidatorConstraint({ name: "isStartBeforeEnd", async: false })
class IsStartBeforeEnd implements ValidatorConstraintInterface {
  validate(_value: string, args: ValidationArguments) {
    const obj = args.object as ScheduleCreateDto;
    if (!obj.startTime || !obj.endTime) return true;
    return obj.startTime < obj.endTime;
  }

  defaultMessage() {
    return "endTime must be after startTime";
  }
}

export class ScheduleCreateDto {
  @ApiProperty()
  @IsUUID()
  barberId: string;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: "09:00", description: "Start time in HH:mm format" })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "startTime must be in HH:mm format",
  })
  startTime: string;

  @ApiProperty({ example: "17:00", description: "End time in HH:mm format" })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "endTime must be in HH:mm format",
  })
  @Validate(IsStartBeforeEnd)
  endTime: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
