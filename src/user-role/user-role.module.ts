import { Module } from "@nestjs/common";
import { UserRoleService } from "./user-role.service.js";
import { UserRoleRepository } from "./user-role.repository.js";
import { UserRoleMapper } from "./mappers/user-role.mapper.js";
import { USER_ROLE_SERVICE } from "./user-role.service.interface.js";
import { RoleModule } from "../role/role.module.js";

@Module({
  imports: [RoleModule],
  providers: [
    UserRoleRepository,
    UserRoleMapper,
    {
      provide: USER_ROLE_SERVICE,
      useClass: UserRoleService,
    },
  ],
  exports: [USER_ROLE_SERVICE, UserRoleRepository, UserRoleMapper],
})
export class UserRoleModule {}
