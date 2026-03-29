import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CommissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  barberId: string;

  @ApiProperty()
  bookingId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  commissionRate: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  collectedAt?: Date | null;

  @ApiPropertyOptional()
  collectedById?: string | null;

  @ApiProperty()
  createdAt: Date;
}
