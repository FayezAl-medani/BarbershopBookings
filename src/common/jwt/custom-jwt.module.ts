import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtServiceUtils } from "./jwt.service.js";

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [JwtServiceUtils],
  exports: [JwtServiceUtils],
})
export class CustomJwtModule {}
