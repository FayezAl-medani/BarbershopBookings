import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CommissionEntity {
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

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<CommissionEntity>) {
    Object.assign(this, props);
  }
}
