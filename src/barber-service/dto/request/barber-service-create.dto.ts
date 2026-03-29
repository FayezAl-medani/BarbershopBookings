import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class BarberServiceCreateDto {
  @ApiProperty()
  @IsUUID()
  barberId: string;

  @ApiProperty()
  @IsUUID()
  serviceId: string;
}
