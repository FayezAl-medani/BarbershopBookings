import { ApiProperty } from "@nestjs/swagger";

export class ScheduleEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  barberId: string;

  @ApiProperty({ example: "MONDAY" })
  dayOfWeek: string;

  @ApiProperty({ example: "09:00" })
  startTime: string;

  @ApiProperty({ example: "17:00" })
  endTime: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<ScheduleEntity>) {
    Object.assign(this, props);
  }
}
