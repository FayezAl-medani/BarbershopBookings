import { Module } from '@nestjs/common';
import { ActiveOtpService } from './active-otp.service.js';
import { ActiveOtpRepository } from './active-otp.repository.js';
import { ActiveOtpMapper } from './mappers/active-otp.mapper.js';
import { ActiveOtpCronJobService } from './cron-job/active-otp.cron.js';
import { ACTIVE_OTP_SERVICE } from './active-otp.service.interface.js';

@Module({
  providers: [
    ActiveOtpRepository,
    ActiveOtpMapper,
    ActiveOtpCronJobService,
    {
      provide: ACTIVE_OTP_SERVICE,
      useClass: ActiveOtpService,
    },
  ],
  exports: [ACTIVE_OTP_SERVICE, ActiveOtpRepository, ActiveOtpMapper],
})
export class ActiveOtpModule {}
