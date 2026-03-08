import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: 'uuid', description: 'The id of the user' })
  id: string;

  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  lastName?: string | null;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Email' })
  email?: string | null;

  @ApiProperty({ example: 'ACTIVE', description: 'User status' })
  status: string;

  @ApiPropertyOptional({ description: 'Last login timestamp' })
  lastLoginAt?: Date | null;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  constructor(props: Partial<UserEntity>) {
    Object.assign(this, props);
  }
}
