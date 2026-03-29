import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class SendOtpDto {
  @ApiProperty({ example: "+966501234567" })
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: "phoneNumber must be a valid phone number",
  })
  phoneNumber: string;
}
