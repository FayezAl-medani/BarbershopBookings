import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from '../../../user/dto/response/user-response.dto.js';

export class AdminResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ type: () => UserResponseDto })
  user?: UserResponseDto;
}
