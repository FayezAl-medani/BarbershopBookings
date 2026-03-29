import { Module } from "@nestjs/common";
import { ServiceController } from "./service.controller.js";
import { ServiceService } from "./service.service.js";
import { ServiceRepository } from "./service.repository.js";
import { ServiceMapper } from "./mappers/service.mapper.js";
import { SERVICE_SERVICE } from "./service.service.interface.js";

@Module({
  controllers: [ServiceController],
  providers: [
    ServiceRepository,
    ServiceMapper,
    {
      provide: SERVICE_SERVICE,
      useClass: ServiceService,
    },
  ],
  exports: [SERVICE_SERVICE, ServiceRepository, ServiceMapper],
})
export class ServiceModule {}
