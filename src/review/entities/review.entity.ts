import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ReviewEntity {
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

  @ApiProperty({ minimum: 1, maximum: 5 })
  rating: number;

  @ApiPropertyOptional()
  comment?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<ReviewEntity>) {
    Object.assign(this, props);
  }
}
