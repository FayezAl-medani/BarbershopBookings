import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  barberId: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  paymentMethod: string;

  @ApiPropertyOptional()
  notes?: string | null;
}
