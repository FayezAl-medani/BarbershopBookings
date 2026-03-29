import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ServiceEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  barbershopId: string;

  @ApiProperty({ example: "Haircut" })
  name: string;

  @ApiPropertyOptional({
    example: "Standard haircut with clippers and scissors",
  })
  description?: string | null;

  @ApiProperty({ example: 30, description: "Duration in minutes" })
  duration: number;

  @ApiProperty({ example: 25.0, description: "Price" })
  price: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<ServiceEntity>) {
    Object.assign(this, props);
  }
}
