import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class ServiceCreateDto {
  @ApiProperty({ description: "Barbershop ID this service belongs to" })
  @IsUUID()
  barbershopId: string;

  @ApiProperty({ example: "Haircut" })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: "Standard haircut" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: 30, description: "Duration in minutes" })
  @Type(() => Number)
  @IsNumber()
  @Min(5)
  duration: number;

  @ApiProperty({ example: 25.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
