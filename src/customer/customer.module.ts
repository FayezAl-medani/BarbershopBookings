import { Module, forwardRef } from '@nestjs/common';
import { CustomerController } from './customer.controller.js';
import { CustomerService } from './customer.service.js';
import { CustomerRepository } from './customer.repository.js';
import { CustomerMapper } from './mappers/customer.mapper.js';
import { CUSTOMER_SERVICE } from './customer.service.interface.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [CustomerController],
  providers: [
    CustomerRepository,
    CustomerMapper,
    {
      provide: CUSTOMER_SERVICE,
      useClass: CustomerService,
    },
  ],
  exports: [CUSTOMER_SERVICE, CustomerRepository, CustomerMapper],
})
export class CustomerModule {}
