import { Injectable } from "@nestjs/common";
import { ActiveOtp } from "@prisma/client";
import { ActiveOtpEntity } from "../entities/active-otp.entity.js";

@Injectable()
export class ActiveOtpMapper {
  modelToEntity(model: ActiveOtp): ActiveOtpEntity {
    return new ActiveOtpEntity({
      id: model.id,
      identifier: model.identifier,
      identifierType: model.identifierType,
      hashedOtp: model.hashedOtp,
      attempts: model.attempts,
      resendAttempts: model.resendAttempts,
      expiresAt: model.expiresAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
