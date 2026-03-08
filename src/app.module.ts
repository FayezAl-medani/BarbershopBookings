import { Module, RequestMethod } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { validateEnv } from './common/config/index.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/index.js';
import { CustomJwtModule } from './common/jwt/custom-jwt.module.js';
import {
  AcceptLanguageResolver,
  I18nJsonLoader,
  I18nModule,
} from 'nestjs-i18n';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from './common/guards/index.js';

// Feature modules
import { UserModule } from './user/user.module.js';
import { AdminModule } from './admin/admin.module.js';
import { BarberModule } from './barber/barber.module.js';
import { CustomerModule } from './customer/customer.module.js';
import { ServiceModule } from './service/service.module.js';
import { ScheduleModule as BarberScheduleModule } from './schedule/schedule.module.js';
import { BarberServiceModule } from './barber-service/barber-service.module.js';
import { BookingModule } from './booking/booking.module.js';
import { AuthModule } from './auth/auth.module.js';
import { TokenModule } from './token/token.module.js';
import { ActiveOtpModule } from './active-otp/active-otp.module.js';
import { UserCredentialModule } from './user-credential/user-credential.module.js';
import { RoleModule } from './role/role.module.js';
import { UserRoleModule } from './user-role/user-role.module.js';

const PINO_LOGGER_EXCLUDE_HOSTNAME_PID = { base: undefined };

@Module({
  imports: [
    PrismaModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: join(
          process.cwd(),
          process.env.NODE_ENV === 'production'
            ? 'dist/common/i18n'
            : 'src/common/i18n',
        ),
      },
      resolvers: [AcceptLanguageResolver],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: './.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        ...PINO_LOGGER_EXCLUDE_HOSTNAME_PID,
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          (process.env.NODE_ENV ?? 'Development') === 'Development' ||
          process.env.LOG_FORMAT === 'pretty'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  levelFirst: true,
                  translateTime: 'SYS:standard',
                  ignore:
                    'context,responseTime,trace_id,span_id,trace_flags,dd',
                  messageFormat: '{context}| {msg}',
                },
              }
            : undefined,
      },
      exclude: [
        { method: RequestMethod.ALL, path: 'check' },
        { method: RequestMethod.GET, path: 'health/startup' },
        { method: RequestMethod.GET, path: 'health/liveness' },
        { method: RequestMethod.GET, path: 'health/readiness' },
      ],
    }),
    ScheduleModule.forRoot(),
    CustomJwtModule,

    // Feature modules
    ActiveOtpModule,
    AdminModule,
    AuthModule,
    BarberModule,
    BarberServiceModule,
    BarberScheduleModule,
    BookingModule,
    CustomerModule,
    RoleModule,
    ServiceModule,
    TokenModule,
    UserModule,
    UserCredentialModule,
    UserRoleModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
