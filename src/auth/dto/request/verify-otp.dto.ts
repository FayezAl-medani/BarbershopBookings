import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({ example: "+966501234567" })
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: "phoneNumber must be a valid phone number",
  })
  phoneNumber: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(6, 6)
  otp: string;
}
