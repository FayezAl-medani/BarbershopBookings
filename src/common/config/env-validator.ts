import { Type, plainToInstance } from "class-transformer";
import { IsNumber, IsOptional, IsString, validateSync } from "class-validator";

export class EnvironmentVariables {
  @IsString() @IsOptional() APP_NAME?: string;
  @IsString() @IsOptional() NODE_ENV?: string;
  @IsNumber() @Type(() => Number) @IsOptional() PORT?: number;

  @IsString() DATABASE_URL: string;

  @IsString() JWT_ACCESS_SECRET: string;
  @IsString() JWT_ACCESS_EXPIRE: string;
  @IsString() JWT_REFRESH_SECRET: string;
  @IsString() JWT_REFRESH_EXPIRE: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) throw new Error(errors.toString());
  return validatedConfig;
}
