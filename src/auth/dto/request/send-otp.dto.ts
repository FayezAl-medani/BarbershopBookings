import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phoneNumber: string;
}
