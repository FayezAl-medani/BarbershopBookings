import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  isRead: boolean;

  @ApiPropertyOptional()
  data?: any;

  @ApiProperty()
  createdAt: Date;
}
