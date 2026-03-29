import { Injectable, OnModuleInit, INestApplication } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: parseInt(process.env.DB_POOL_MAX || "10", 10),
      idleTimeoutMillis: parseInt(
        process.env.DB_POOL_IDLE_TIMEOUT || "30000",
        10,
      ),
    });
    const adapter = new PrismaPg(pool);

    const logConfig =
      process.env.NODE_ENV === "production"
        ? [
            { emit: "event" as const, level: "error" as const },
            { emit: "event" as const, level: "warn" as const },
          ]
        : [
            { emit: "event" as const, level: "query" as const },
            { emit: "event" as const, level: "error" as const },
            { emit: "event" as const, level: "warn" as const },
            { emit: "event" as const, level: "info" as const },
          ];

    super({
      adapter,
      log: logConfig,
    } as any);
  }

  async onModuleInit() {
    // Connection is automatic with adapter
  }

  async enableShutdownHooks(_app: INestApplication) {
    // Shutdown hooks handled by NestJS lifecycle
  }
}
