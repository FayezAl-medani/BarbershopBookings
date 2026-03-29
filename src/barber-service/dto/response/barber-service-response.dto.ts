import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ServiceResponseDto } from "../../../service/dto/response/service-response.dto.js";

export class BarberServiceResponseDto {
  @ApiProperty()
  barberId: string;

  @ApiProperty()
  serviceId: string;

  @ApiPropertyOptional({ type: () => ServiceResponseDto })
  service?: ServiceResponseDto;
}
