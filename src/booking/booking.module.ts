import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller.js';
import { BookingService } from './booking.service.js';
import { BookingRepository } from './booking.repository.js';
import { BookingMapper } from './mappers/booking.mapper.js';
import { BOOKING_SERVICE } from './booking.service.interface.js';
import { BarberServiceModule } from '../barber-service/barber-service.module.js';
import { ServiceModule } from '../service/service.module.js';
import { ScheduleModule } from '../schedule/schedule.module.js';

@Module({
  imports: [BarberServiceModule, ServiceModule, ScheduleModule],
  controllers: [BookingController],
  providers: [
    BookingRepository,
    BookingMapper,
    {
      provide: BOOKING_SERVICE,
      useClass: BookingService,
    },
  ],
  exports: [BOOKING_SERVICE, BookingRepository, BookingMapper],
})
export class BookingModule {}
