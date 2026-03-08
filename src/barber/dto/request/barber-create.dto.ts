import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class BarberCreateDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: 'Experienced barber specializing in fades' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Fades, Beard Trim' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
