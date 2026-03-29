import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from "class-validator";

export class BookingCreateDto {
  @ApiPropertyOptional({
    description: "Customer ID (auto-filled from JWT if omitted)",
  })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ description: "Barber ID" })
  @IsUUID()
  barberId: string;

  @ApiProperty({ description: "Service ID" })
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    example: "2026-03-15",
    description: "Booking date (YYYY-MM-DD)",
  })
  @IsDateString()
  date: string;

  @ApiProperty({ example: "10:00", description: "Start time in HH:mm format" })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "startTime must be in HH:mm format",
  })
  startTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
