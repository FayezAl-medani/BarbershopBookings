import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ActiveOtpRepository } from "../active-otp.repository.js";

@Injectable()
export class ActiveOtpCronJobService implements OnModuleInit {
  constructor(private readonly activeOtpRepository: ActiveOtpRepository) {}

  async onModuleInit() {
    await this.cleanupExpiredOtps();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async cleanupExpiredOtps() {
    const deletedCount = await this.activeOtpRepository.deleteExpiredOtps();
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired OTPs`);
    }
  }
}
