import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { PrismaTransactionContext } from './prisma-transaction-context.service.js';

@Global()
@Module({
  providers: [PrismaService, PrismaTransactionContext],
  exports: [PrismaService, PrismaTransactionContext],
})
export class PrismaModule {}
