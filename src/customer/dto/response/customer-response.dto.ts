import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from '../../../user/dto/response/user-response.dto.js';

export class CustomerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiPropertyOptional({ type: () => UserResponseDto })
  user?: UserResponseDto;
}
