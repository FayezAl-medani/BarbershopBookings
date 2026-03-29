import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class BarberCreateDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: "Barbershop ID this barber belongs to" })
  @IsUUID()
  barbershopId: string;

  @ApiPropertyOptional({ example: "Experienced barber specializing in fades" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({ example: "Fades, Beard Trim" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialization?: string;

  @ApiPropertyOptional({
    example: 0.15,
    description: "Commission rate (0.0 to 1.0)",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  commissionRate?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
