import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import { Public } from "../common/decorators/public.decorator.js";
import { PrismaService } from "../common/prisma/prisma.service.js";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get("startup")
  @Public()
  @ApiOperation({ summary: "Startup probe" })
  @HealthCheck()
  startup() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma),
    ]);
  }

  @Get("liveness")
  @Public()
  @ApiOperation({ summary: "Liveness probe" })
  liveness() {
    return { status: "ok" };
  }

  @Get("readiness")
  @Public()
  @ApiOperation({ summary: "Readiness probe" })
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma),
    ]);
  }
}
