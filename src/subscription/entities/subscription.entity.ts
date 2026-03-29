import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SubscriptionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  barbershopId: string;

  @ApiProperty()
  planName: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  autoRenew: boolean;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<SubscriptionEntity>) {
    Object.assign(this, props);
  }
}
