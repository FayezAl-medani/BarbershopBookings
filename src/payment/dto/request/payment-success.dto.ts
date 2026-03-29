import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class PaymentSuccessDto {
  @ApiPropertyOptional({ description: "Payment gateway reference" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  gatewayRef?: string;
}
