import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";

export enum PaymentTypeDto {
  DEPOSIT = "DEPOSIT",
  FULL = "FULL",
  REFUND = "REFUND",
}

export enum PaymentMethodDto {
  CASH = "CASH",
  VISA = "VISA",
  MASTERCARD = "MASTERCARD",
  MADA = "MADA",
  APPLE_PAY = "APPLE_PAY",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export class PaymentCreateDto {
  @ApiProperty()
  @IsUUID()
  bookingId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: PaymentTypeDto })
  @IsEnum(PaymentTypeDto)
  type: PaymentTypeDto;

  @ApiProperty({ enum: PaymentMethodDto })
  @IsEnum(PaymentMethodDto)
  method: PaymentMethodDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gatewayRef?: string;
}
