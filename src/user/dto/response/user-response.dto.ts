import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  firstName?: string | null;

  @ApiPropertyOptional()
  lastName?: string | null;

  @ApiProperty()
  phoneNumber: string;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiProperty()
  status: string;
}
