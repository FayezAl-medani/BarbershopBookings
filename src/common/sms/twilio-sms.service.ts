import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ISmsService } from "./sms.service.interface.js";

/**
 * Twilio-based SMS service for production OTP delivery.
 *
 * Required environment variables:
 *   TWILIO_ACCOUNT_SID   – Twilio Account SID
 *   TWILIO_AUTH_TOKEN     – Twilio Auth Token
 *   TWILIO_PHONE_NUMBER   – Twilio sender phone number (e.g. +1234567890)
 *
 * Install the SDK:  npm install twilio
 */
@Injectable()
export class TwilioSmsService implements ISmsService {
  private readonly logger = new Logger(TwilioSmsService.name);
  private client: any;
  private readonly fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>("TWILIO_ACCOUNT_SID");
    const authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN");
    this.fromNumber =
      this.configService.get<string>("TWILIO_PHONE_NUMBER") ?? "";

    if (!accountSid || !authToken) {
      this.logger.error(
        "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set. SMS delivery will fail.",
      );
    }

    // Dynamic import so the app doesn't crash if twilio isn't installed yet
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const twilio = require("twilio");
      this.client = twilio(accountSid, authToken);
    } catch {
      this.logger.error(
        "twilio package not installed. Run: npm install twilio",
      );
    }
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    if (!this.client) {
      throw new Error(
        "Twilio client not initialised — check env vars and twilio package.",
      );
    }

    await this.client.messages.create({
      body: `Your barbershop verification code is: ${otp}. It expires in 3 minutes.`,
      from: this.fromNumber,
      to: phoneNumber,
    });

    this.logger.log(`OTP sent to ${phoneNumber.slice(0, 4)}****`);
  }
}
