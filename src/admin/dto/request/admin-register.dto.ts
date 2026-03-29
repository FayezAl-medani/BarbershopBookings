import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class AdminRegisterDto {
  @ApiPropertyOptional({ example: "Admin" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: "User" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ example: "+966501234567" })
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: "phoneNumber must be a valid phone number",
  })
  phoneNumber: string;

  @ApiProperty({ example: "admin@barbershop.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "StrongP@ss1" })
  @IsString()
  @MinLength(8)
  password: string;
}
