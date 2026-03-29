import { IsUUID } from "class-validator";

export class UserRoleCreateDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  roleId: string;
}
