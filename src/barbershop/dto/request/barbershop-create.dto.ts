import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class BarbershopCreateDto {
  @ApiProperty({ example: "Royal Barbershop / صالون رويال" })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: "Premium barbershop in Riyadh" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: "King Fahd Road, Riyadh" })
  @IsString()
  @MaxLength(500)
  address: string;

  @ApiProperty({ example: "Riyadh" })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 24.7136 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 46.6753 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ example: "+966501234567" })
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: "phone must be a valid phone number (E.164 format)",
  })
  phone: string;

  @ApiProperty({ description: "Owner user ID" })
  @IsUUID()
  ownerId: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
