import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RoleEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: Partial<RoleEntity>) {
    Object.assign(this, props);
  }
}
