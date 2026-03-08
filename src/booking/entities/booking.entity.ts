import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookingEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  barberId: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty({ description: 'Booking date' })
  date: Date;

  @ApiProperty({ example: '10:00' })
  startTime: string;

  @ApiProperty({ example: '10:30' })
  endTime: string;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<BookingEntity>) {
    Object.assign(this, props);
  }
}
