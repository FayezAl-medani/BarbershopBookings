import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserEntity } from "../../user/entities/user.entity.js";

export class CustomerEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiPropertyOptional({ type: () => UserEntity })
  user?: UserEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<CustomerEntity>) {
    Object.assign(this, props);
  }
}
