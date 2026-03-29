import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller.js";
import { PaymentService } from "./payment.service.js";
import { PaymentRepository } from "./payment.repository.js";
import { PaymentMapper } from "./mappers/payment.mapper.js";
import { PAYMENT_SERVICE } from "./payment.service.interface.js";
import { BookingModule } from "../booking/booking.module.js";

@Module({
  imports: [BookingModule],
  controllers: [PaymentController],
  providers: [
    PaymentRepository,
    PaymentMapper,
    {
      provide: PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
  exports: [PAYMENT_SERVICE, PaymentRepository, PaymentMapper],
})
export class PaymentModule {}
