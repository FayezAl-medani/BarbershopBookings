import { ApiProperty } from "@nestjs/swagger";
import { ServiceEntity } from "../../service/entities/service.entity.js";

export class BarberServiceEntity {
  @ApiProperty()
  barberId: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty({ type: () => ServiceEntity })
  service?: ServiceEntity;

  @ApiProperty()
  createdAt: Date;

  constructor(props: Partial<BarberServiceEntity>) {
    Object.assign(this, props);
  }
}
