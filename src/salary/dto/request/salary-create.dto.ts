import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export enum SalaryTypeDto {
  FIXED = "FIXED",
  HOURLY = "HOURLY",
  PER_SERVICE = "PER_SERVICE",
}

export class SalaryCreateDto {
  @ApiProperty()
  @IsUUID()
  barberId: string;

  @ApiProperty({ enum: SalaryTypeDto })
  @IsEnum(SalaryTypeDto)
  type: SalaryTypeDto;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ default: "SAR" })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ example: "2026-01-01" })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ example: "2026-01-31" })
  @IsDateString()
  periodEnd: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
