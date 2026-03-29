import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SMS_SERVICE } from "./sms.service.interface.js";
import { ConsoleSmsService } from "./console-sms.service.js";
import { TwilioSmsService } from "./twilio-sms.service.js";

@Global()
@Module({
  providers: [
    {
      provide: SMS_SERVICE,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>("SMS_PROVIDER");
        if (provider === "twilio") {
          return new TwilioSmsService(configService);
        }
        // Default to console logger for development
        return new ConsoleSmsService();
      },
      inject: [ConfigService],
    },
  ],
  exports: [SMS_SERVICE],
})
export class SmsModule {}
