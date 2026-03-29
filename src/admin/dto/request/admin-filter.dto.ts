import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsUUID } from "class-validator";

export class AdminFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}
