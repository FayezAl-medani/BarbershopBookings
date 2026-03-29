import { Injectable, Logger } from "@nestjs/common";
import type { ISmsService } from "./sms.service.interface.js";

/**
 * Development-only SMS service that logs OTPs to the console.
 * Replace with TwilioSmsService (or another provider) in production.
 */
@Injectable()
export class ConsoleSmsService implements ISmsService {
  private readonly logger = new Logger(ConsoleSmsService.name);

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    this.logger.warn(
      `[DEV] OTP for ${phoneNumber}: ${otp} — Replace ConsoleSmsService with a real provider before launch.`,
    );
  }
}
