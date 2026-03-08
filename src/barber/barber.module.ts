import { Module, forwardRef } from '@nestjs/common';
import { BarberController } from './barber.controller.js';
import { BarberService } from './barber.service.js';
import { BarberRepository } from './barber.repository.js';
import { BarberMapper } from './mappers/barber.mapper.js';
import { BARBER_SERVICE } from './barber.service.interface.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [BarberController],
  providers: [
    BarberRepository,
    BarberMapper,
    {
      provide: BARBER_SERVICE,
      useClass: BarberService,
    },
  ],
  exports: [BARBER_SERVICE, BarberRepository, BarberMapper],
})
export class BarberModule {}
