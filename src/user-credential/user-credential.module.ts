import { Module } from "@nestjs/common";
import { UserCredentialService } from "./user-credential.service.js";
import { UserCredentialRepository } from "./user-credential.repository.js";
import { UserCredentialMapper } from "./mappers/user-credential.mapper.js";
import { USER_CREDENTIAL_SERVICE } from "./user-credential.service.interface.js";

@Module({
  providers: [
    UserCredentialRepository,
    UserCredentialMapper,
    {
      provide: USER_CREDENTIAL_SERVICE,
      useClass: UserCredentialService,
    },
  ],
  exports: [
    USER_CREDENTIAL_SERVICE,
    UserCredentialRepository,
    UserCredentialMapper,
  ],
})
export class UserCredentialModule {}
