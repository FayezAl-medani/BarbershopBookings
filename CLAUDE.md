# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build              # Compile (nest build)
npm run start:dev          # Dev server with watch
npm test                   # Run all tests
npx jest path/to/file.spec.ts          # Run a single test file
npx jest --testPathPattern=booking     # Run tests matching pattern
npm run lint               # ESLint with auto-fix
npx prisma migrate dev     # Apply schema changes
npx prisma generate        # Regenerate Prisma client after schema changes
npx prisma db seed         # Seed database (ts-node prisma/seed.ts)
```

## Architecture

NestJS 11 backend with Prisma 7 + PostgreSQL. ESM module system (`"module": "nodenext"`).

### Module Pattern

Every feature module follows: **Controller → Service → Repository → Entity**

```
src/<module>/
  <module>.module.ts                 # DI wiring
  <module>.controller.ts             # HTTP layer
  <module>.service.ts                # Business logic
  <module>.service.interface.ts      # Interface + string token (e.g. BOOKING_SERVICE = 'IBookingService')
  <module>.repository.ts             # Prisma queries via PrismaTransactionContext
  entities/                          # Domain entities with Swagger decorators
  dto/request/                       # Input validation (class-validator)
  dto/response/                      # Output serialization
  mappers/                           # Model → Entity → ResponseDto conversions
```

### Dependency Injection

Services are injected via **string tokens**, not classes:
```typescript
// In module: { provide: BOOKING_SERVICE, useClass: BookingService }
// In consumer: @Inject(BOOKING_SERVICE) private readonly bookingService: IBookingService
```

Cross-module dependencies use `forwardRef(() => OtherModule)` when circular (e.g. Booking ↔ Commission).

### Import Convention

All local imports **must** use `.js` extensions for ESM compatibility:
```typescript
import { BookingService } from './booking.service.js';
```
Jest resolves these via `moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" }` in package.json.

### Database Layer

- `PrismaService` — singleton client with `@prisma/adapter-pg` (raw `pg` pool, configurable via `DB_POOL_MAX`/`DB_POOL_IDLE_TIMEOUT`). Query logging disabled in production.
- `PrismaTransactionContext` — uses `AsyncLocalStorage` to propagate transactions; repositories call `this.txContext.getClient()` to get either the transaction client or the default Prisma client
- `paginator()` — shared utility wrapping `findMany` + `count` into `{ data, meta }` responses

### Auth & Authorization

Four global guards applied via `APP_GUARD` in app.module.ts:
1. `JwtAuthGuard` — validates bearer token (skip with `@Public()`)
2. `RolesGuard` — checks `@Roles('ADMIN', 'SUPER_ADMIN')` decorator
3. `PermissionsGuard` — checks `@Permissions('CREATE_BOOKING')` decorator
4. `ThrottlerGuard` — rate limiting (5 req/sec burst, 60 req/min sustained)

Roles: `SUPER_ADMIN`, `ADMIN`, `BARBERSHOP_OWNER`, `BARBER`, `CUSTOMER`.

JWT payload contains `userId`, optional `adminId`/`barberId`/`customerId`/`barbershopId`, `loggedInAs` (active role), and `roles[]`. Access it with `@CurrentUser()` parameter decorator.

### Tenant Isolation Pattern

Controllers enforce ownership checks at the HTTP layer using `@CurrentUser()`:
- **BARBERSHOP_OWNER**: `barbershopId` forced from JWT on create; ownership verified via entity lookup on update/delete (barber, service, upload, barbershop, salary). List queries force `barbershopId` filter (analytics, salary, commission, subscription).
- **BARBER**: `barberId` forced from JWT on schedule create; ownership verified on update/delete. Barber-service add/remove checks self-ownership. Booking list scoped to own bookings.
- **CUSTOMER**: `customerId` forced from JWT on booking create and review create. Booking list scoped to own bookings.
- **ADMIN/SUPER_ADMIN**: No scoping restrictions.

Pattern for write-path checks:
```typescript
private async assertOwnership(id: string, user: JwtPayloadWithAuth): void {
  if (user.loggedInAs !== RoleName.BARBERSHOP_OWNER) return;
  const entity = await this.service.getById(id);
  if (entity.barbershopId !== user.barbershopId) {
    throw new ForbiddenException('...');
  }
}
```

### Booking Status Transitions

Status changes only happen through dedicated endpoints — `status` is not exposed on `BookingPatchDto`:
- `PATCH /booking/:id/cancel` — only from PENDING or CONFIRMED
- `PATCH /booking/:id/complete` — only from PENDING or CONFIRMED (triggers commission creation)
- Generic `PATCH /booking/:id` only allows updating `notes`

### Input Validation

DTOs enforce `@MaxLength` on all text fields, `@Matches` (E.164) on phone numbers, `@Min/@Max` on lat/lon coordinates, and cross-field validation where needed (e.g. `endTime > startTime` in schedules, `periodEnd > periodStart` in salary).

### Security Middleware

Applied in `main.ts`: CORS whitelist (`ALLOWED_ORIGINS` env), `helmet()`, `compression()`, `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`.

### Response Format

All endpoints return wrapped DTOs:
- Single: `DataResponseDto<T>` — `{ status, data }`
- Paginated: `PagingDataResponseDto<T>` — `{ status, data[], meta: { total, lastPage, currentPage, perPage, prev, next } }`

Use Swagger decorators: `@ApiDataResponse()`, `@ApiPaginatedResponse()`, `@ApiCreatedDataResponse()`.

### i18n

Error messages use `nestjs-i18n`. Translation JSON files live in `src/common/i18n/` and are copied to `dist/` at build time. Usage: `this.i18nService.translate('errors.BOOKING.NOT_FOUND')`.

### Testing

Tests instantiate services directly with mock objects (no `TestingModule`):
```typescript
const mockRepo = { create: jest.fn(), findById: jest.fn() };
const service = new MyService(mockRepo as any, ...);
```

### Key Shared Utilities (src/common/)

- **Guards**: `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`, `BarbershopOwnerGuard`
- **Decorators**: `@Public()`, `@Roles()`, `@Permissions()`, `@CurrentUser()`, `@SortingParams()`, `@BearerToken()`
- **DTOs**: `PaginationParams`, `DataResponseDto`, `PagingDataResponseDto`
- **Filters**: `AllExceptionsFilter` — handles HttpException, Prisma errors, generic errors
- **JWT**: `CustomJwtService` — `generateTokenPair()`, `verifyAccessToken()`

### Environment Variables

Required: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRE`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRE`. Optional: `NODE_ENV`, `PORT` (default 3000), `ALLOWED_ORIGINS` (CORS), `SMS_PROVIDER` (`console`|`twilio`), `DB_POOL_MAX`, `DB_POOL_IDLE_TIMEOUT`. Validated at startup via `src/common/config/env-validator.ts`.

### Health Checks

`/health/startup`, `/health/liveness`, `/health/readiness` — powered by `@nestjs/terminus`. Startup and readiness probe the database; liveness returns `{ status: 'ok' }`. All are `@Public()` and excluded from pino logging.

### SMS Service

`src/common/sms/` — interface-based (`ISmsService`/`SMS_SERVICE` token). `SmsModule` is `@Global()` and selects implementation via `SMS_PROVIDER` env: `console` (dev, logs OTP to logger) or `twilio` (production).
