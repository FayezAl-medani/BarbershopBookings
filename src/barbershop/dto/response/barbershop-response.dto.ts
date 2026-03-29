import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BarbershopResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiPropertyOptional()
  coverImageUrl?: string | null;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  ownerId: string;

  @ApiPropertyOptional()
  avgRating?: number | null;

  @ApiPropertyOptional()
  reviewCount?: number | null;
}
