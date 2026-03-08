import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AdminCreateDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 'admin@barbershop.com' })
  @IsEmail()
  email: string;
}
