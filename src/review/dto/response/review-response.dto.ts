import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  barbershopId: string;

  @ApiPropertyOptional()
  barberId?: string | null;

  @ApiProperty()
  bookingId: string;

  @ApiProperty()
  rating: number;

  @ApiPropertyOptional()
  comment?: string | null;

  @ApiProperty()
  createdAt: Date;
}
