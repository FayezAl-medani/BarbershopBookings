import { Module, forwardRef } from "@nestjs/common";
import { CommissionController } from "./commission.controller.js";
import { CommissionService } from "./commission.service.js";
import { CommissionRepository } from "./commission.repository.js";
import { CommissionMapper } from "./mappers/commission.mapper.js";
import { COMMISSION_SERVICE } from "./commission.service.interface.js";
import { BookingModule } from "../booking/booking.module.js";
import { BarberModule } from "../barber/barber.module.js";

@Module({
  imports: [forwardRef(() => BookingModule), BarberModule],
  controllers: [CommissionController],
  providers: [
    CommissionRepository,
    CommissionMapper,
    {
      provide: COMMISSION_SERVICE,
      useClass: CommissionService,
    },
  ],
  exports: [COMMISSION_SERVICE, CommissionRepository, CommissionMapper],
})
export class CommissionModule {}
