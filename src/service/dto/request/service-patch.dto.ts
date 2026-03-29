import { PartialType, OmitType } from "@nestjs/swagger";
import { ServiceCreateDto } from "./service-create.dto.js";

export class ServicePatchDto extends PartialType(
  OmitType(ServiceCreateDto, ["barbershopId"] as const),
) {}
