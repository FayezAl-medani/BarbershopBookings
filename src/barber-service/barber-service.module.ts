import { Module } from "@nestjs/common";
import { BarberServiceController } from "./barber-service.controller.js";
import { BarberServiceService } from "./barber-service.service.js";
import { BarberServiceRepository } from "./barber-service.repository.js";
import { BARBER_SERVICE_SERVICE } from "./barber-service.service.interface.js";

@Module({
  controllers: [BarberServiceController],
  providers: [
    BarberServiceRepository,
    {
      provide: BARBER_SERVICE_SERVICE,
      useClass: BarberServiceService,
    },
  ],
  exports: [BARBER_SERVICE_SERVICE, BarberServiceRepository],
})
export class BarberServiceModule {}
