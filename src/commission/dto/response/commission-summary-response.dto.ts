import { ApiProperty } from "@nestjs/swagger";

export class CommissionSummaryResponseDto {
  @ApiProperty()
  totalPending: number;

  @ApiProperty()
  totalCollected: number;

  @ApiProperty()
  pendingCount: number;

  @ApiProperty()
  collectedCount: number;
}
