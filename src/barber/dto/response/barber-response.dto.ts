import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserResponseDto } from "../../../user/dto/response/user-response.dto.js";

export class BarberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  barbershopId: string;

  @ApiPropertyOptional()
  bio?: string | null;

  @ApiPropertyOptional()
  specialization?: string | null;

  @ApiPropertyOptional()
  commissionRate?: number | null;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional({ type: () => UserResponseDto })
  user?: UserResponseDto;
}
