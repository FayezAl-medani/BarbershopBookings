import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SalaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  barberId: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  periodStart: Date;

  @ApiProperty()
  periodEnd: Date;

  @ApiPropertyOptional()
  paidAt?: Date | null;

  @ApiProperty()
  isPaid: boolean;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  createdAt: Date;
}
