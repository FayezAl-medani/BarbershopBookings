import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsUUID } from "class-validator";

export enum CommissionStatusFilter {
  PENDING = "PENDING",
  COLLECTED = "COLLECTED",
}

export class CommissionFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barberId?: string;

  @ApiPropertyOptional({ enum: CommissionStatusFilter })
  @IsOptional()
  @IsEnum(CommissionStatusFilter)
  status?: CommissionStatusFilter;

  @ApiPropertyOptional({
    description: "Filter by barbershop (through barber relation)",
  })
  @IsOptional()
  @IsUUID()
  barbershopId?: string;

  @ApiPropertyOptional({ example: "2026-01-01" })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: "2026-12-31" })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
