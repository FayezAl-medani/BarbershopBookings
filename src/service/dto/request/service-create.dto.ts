import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceCreateDto {
  @ApiProperty({ example: 'Haircut' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Standard haircut' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 30, description: 'Duration in minutes' })
  @Type(() => Number)
  @IsNumber()
  @Min(5)
  duration: number;

  @ApiProperty({ example: 25.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
