import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

export class PaymentFailDto {
  @ApiProperty({ description: "Reason for payment failure" })
  @IsString()
  @MaxLength(500)
  reason: string;
}
