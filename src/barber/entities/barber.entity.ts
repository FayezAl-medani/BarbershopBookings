import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserEntity } from "../../user/entities/user.entity.js";

export class BarberEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  barbershopId: string;

  @ApiPropertyOptional()
  bio?: string | null;

  @ApiPropertyOptional()
  specialization?: string | null;

  @ApiPropertyOptional()
  commissionRate?: number | null;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional({ type: () => UserEntity })
  user?: UserEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<BarberEntity>) {
    Object.assign(this, props);
  }
}
