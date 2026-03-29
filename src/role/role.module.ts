import { Module } from "@nestjs/common";
import { RoleController } from "./role.controller.js";
import { RoleService } from "./role.service.js";
import { RoleRepository } from "./role.repository.js";
import { RoleMapper } from "./mappers/role.mapper.js";
import { ROLE_SERVICE } from "./role.service.interface.js";

@Module({
  controllers: [RoleController],
  providers: [
    RoleRepository,
    RoleMapper,
    {
      provide: ROLE_SERVICE,
      useClass: RoleService,
    },
  ],
  exports: [ROLE_SERVICE, RoleRepository, RoleMapper],
})
export class RoleModule {}
