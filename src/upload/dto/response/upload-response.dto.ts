import { ApiProperty } from "@nestjs/swagger";

export class UploadResponseDto {
  @ApiProperty()
  imageUrl: string;
}
