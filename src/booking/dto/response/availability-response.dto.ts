import { ApiProperty } from "@nestjs/swagger";

export class TimeSlotDto {
  @ApiProperty({ example: "09:00" })
  startTime: string;

  @ApiProperty({ example: "09:30" })
  endTime: string;
}

export class AvailabilityResponseDto {
  @ApiProperty()
  barberId: string;

  @ApiProperty({ example: "2026-03-15" })
  date: string;

  @ApiProperty({ type: [TimeSlotDto] })
  availableSlots: TimeSlotDto[];
}
