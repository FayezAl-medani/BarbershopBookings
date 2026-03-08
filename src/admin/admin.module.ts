import { Module, forwardRef } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AdminRepository } from './admin.repository.js';
import { AdminMapper } from './mappers/admin.mapper.js';
import { ADMIN_SERVICE } from './admin.service.interface.js';
import { UserModule } from '../user/user.module.js';
import { UserCredentialModule } from '../user-credential/user-credential.module.js';
import { RoleModule } from '../role/role.module.js';
import { UserRoleModule } from '../user-role/user-role.module.js';

@Module({
  imports: [
    forwardRef(() => UserModule),
    UserCredentialModule,
    RoleModule,
    UserRoleModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminRepository,
    AdminMapper,
    {
      provide: ADMIN_SERVICE,
      useClass: AdminService,
    },
  ],
  exports: [ADMIN_SERVICE, AdminRepository, AdminMapper],
})
export class AdminModule {}
