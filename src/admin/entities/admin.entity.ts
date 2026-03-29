import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserEntity } from "../../user/entities/user.entity.js";

export class AdminEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ type: () => UserEntity })
  user?: UserEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<AdminEntity>) {
    Object.assign(this, props);
  }
}
