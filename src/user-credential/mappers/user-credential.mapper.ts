import { Injectable } from '@nestjs/common';
import { UserCredential } from '@prisma/client';
import { UserCredentialEntity } from '../entities/user-credential.entity.js';

@Injectable()
export class UserCredentialMapper {
  modelToEntity(model: UserCredential): UserCredentialEntity {
    return new UserCredentialEntity({
      id: model.id,
      userId: model.userId,
      method: model.method,
      identifier: model.identifier,
      secretHash: model.secretHash,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
