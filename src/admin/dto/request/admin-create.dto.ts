import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsUUID } from "class-validator";

export class AdminCreateDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ example: "admin@barbershop.com" })
  @IsEmail()
  email: string;
}
