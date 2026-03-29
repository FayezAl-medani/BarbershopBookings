import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { IdentifierType } from "../../enums/identifier-type.enum.js";

export class ActiveOtpCreateDto {
  @IsString()
  identifier: string;

  @IsEnum(IdentifierType)
  identifierType: IdentifierType;

  @IsString()
  hashedOtp: string;

  @IsNumber()
  attempts: number;

  @IsNumber()
  resendAttempts: number;

  @IsDate()
  expiresAt: Date;
}
