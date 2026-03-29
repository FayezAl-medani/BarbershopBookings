import { IsOptional, IsString, IsUUID } from "class-validator";

export class UserCredentialCreateDto {
  @IsUUID()
  userId: string;

  @IsString()
  method: string;

  @IsString()
  identifier: string;

  @IsOptional()
  @IsString()
  secretHash?: string;
}
