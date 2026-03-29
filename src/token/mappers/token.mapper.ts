import { Injectable } from "@nestjs/common";
import { Token } from "@prisma/client";
import { TokenEntity } from "../entities/token.entity.js";

@Injectable()
export class TokenMapper {
  modelToEntity(model: Token): TokenEntity {
    return new TokenEntity({
      id: model.id,
      userId: model.userId,
      accessToken: model.accessToken,
      refreshToken: model.refreshToken,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
