import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";
import { Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service.js";

@Injectable()
export class PrismaTransactionContext {
  private asyncLocalStorage = new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor(private readonly prisma: PrismaService) {}

  async runInTransaction<T>(callback: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return this.asyncLocalStorage.run(tx, callback);
    });
  }

  getClient(): Prisma.TransactionClient | typeof this.prisma {
    const txClient = this.asyncLocalStorage.getStore();
    return txClient || this.prisma;
  }
}
