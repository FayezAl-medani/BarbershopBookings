import { Module } from "@nestjs/common";
import { BarbershopController } from "./barbershop.controller.js";
import { BarbershopService } from "./barbershop.service.js";
import { BarbershopRepository } from "./barbershop.repository.js";
import { BarbershopMapper } from "./mappers/barbershop.mapper.js";
import { BARBERSHOP_SERVICE } from "./barbershop.service.interface.js";

@Module({
  controllers: [BarbershopController],
  providers: [
    BarbershopRepository,
    BarbershopMapper,
    {
      provide: BARBERSHOP_SERVICE,
      useClass: BarbershopService,
    },
  ],
  exports: [BARBERSHOP_SERVICE, BarbershopRepository, BarbershopMapper],
})
export class BarbershopModule {}
