import { ApiProperty } from "@nestjs/swagger";

export class OtpSentResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  expiresInSeconds: number;
}
