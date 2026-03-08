import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { UserRepository } from './user.repository.js';
import { UserMapper } from './mappers/user.mapper.js';
import { USER_SERVICE } from './user.service.interface.js';

@Module({
  controllers: [UserController],
  providers: [
    UserRepository,
    UserMapper,
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
  ],
  exports: [USER_SERVICE, UserRepository, UserMapper],
})
export class UserModule {}
