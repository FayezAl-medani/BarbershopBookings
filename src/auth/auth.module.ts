import { Module, forwardRef } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";
import { UserModule } from "../user/user.module.js";
import { AdminModule } from "../admin/admin.module.js";
import { BarberModule } from "../barber/barber.module.js";
import { CustomerModule } from "../customer/customer.module.js";
import { TokenModule } from "../token/token.module.js";
import { ActiveOtpModule } from "../active-otp/active-otp.module.js";
import { UserCredentialModule } from "../user-credential/user-credential.module.js";
import { UserRoleModule } from "../user-role/user-role.module.js";
import { RoleModule } from "../role/role.module.js";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    forwardRef(() => UserModule),
    forwardRef(() => AdminModule),
    forwardRef(() => BarberModule),
    forwardRef(() => CustomerModule),
    TokenModule,
    ActiveOtpModule,
    UserCredentialModule,
    UserRoleModule,
    RoleModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
