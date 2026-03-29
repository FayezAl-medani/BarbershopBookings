import { IsString, IsUUID } from "class-validator";

export class TokenCreateDto {
  @IsUUID()
  userId: string;

  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}
