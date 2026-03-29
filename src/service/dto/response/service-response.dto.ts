import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ServiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  barbershopId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  isActive: boolean;
}
