import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { SubscriptionStatusDto } from "./subscription-patch.dto.js";

export class SubscriptionFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbershopId?: string;

  @ApiPropertyOptional({ enum: SubscriptionStatusDto })
  @IsOptional()
  @IsEnum(SubscriptionStatusDto)
  status?: SubscriptionStatusDto;
}
