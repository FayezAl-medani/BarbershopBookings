import { Module } from "@nestjs/common";
import { SalaryController } from "./salary.controller.js";
import { SalaryService } from "./salary.service.js";
import { SalaryRepository } from "./salary.repository.js";
import { SalaryMapper } from "./mappers/salary.mapper.js";
import { SALARY_SERVICE } from "./salary.service.interface.js";
import { BarberModule } from "../barber/barber.module.js";

@Module({
  imports: [BarberModule],
  controllers: [SalaryController],
  providers: [
    SalaryRepository,
    SalaryMapper,
    {
      provide: SALARY_SERVICE,
      useClass: SalaryService,
    },
  ],
  exports: [SALARY_SERVICE, SalaryRepository, SalaryMapper],
})
export class SalaryModule {}
