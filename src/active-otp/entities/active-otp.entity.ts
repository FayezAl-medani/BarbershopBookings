import { ApiProperty } from "@nestjs/swagger";

export class ActiveOtpEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  identifier: string;

  @ApiProperty()
  identifierType: string;

  @ApiProperty()
  hashedOtp: string;

  @ApiProperty()
  attempts: number;

  @ApiProperty()
  resendAttempts: number;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<ActiveOtpEntity>) {
    Object.assign(this, props);
  }
}
