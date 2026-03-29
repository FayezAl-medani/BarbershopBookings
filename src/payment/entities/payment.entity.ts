import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PaymentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  gatewayRef?: string | null;

  @ApiPropertyOptional()
  failureReason?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<PaymentEntity>) {
    Object.assign(this, props);
  }
}
