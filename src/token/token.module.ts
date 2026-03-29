import { Module } from "@nestjs/common";
import { TokenService } from "./token.service.js";
import { TokenRepository } from "./token.repository.js";
import { TokenMapper } from "./mappers/token.mapper.js";
import { TOKEN_SERVICE } from "./token.service.interface.js";

@Module({
  providers: [
    TokenRepository,
    TokenMapper,
    {
      provide: TOKEN_SERVICE,
      useClass: TokenService,
    },
  ],
  exports: [TOKEN_SERVICE, TokenRepository, TokenMapper],
})
export class TokenModule {}
