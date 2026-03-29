import { ApiProperty } from "@nestjs/swagger";
import { RoleEntity } from "../../role/entities/role.entity.js";

export class UserRoleEntity {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  roleId: string;

  @ApiProperty({ type: () => RoleEntity })
  role?: RoleEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<UserRoleEntity>) {
    Object.assign(this, props);
  }
}
