import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserCredentialEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  identifier: string;

  @ApiPropertyOptional()
  secretHash?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<UserCredentialEntity>) {
    Object.assign(this, props);
  }
}
