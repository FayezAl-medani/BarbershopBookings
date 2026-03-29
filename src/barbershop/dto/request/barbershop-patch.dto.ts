import { PartialType, OmitType } from "@nestjs/swagger";
import { BarbershopCreateDto } from "./barbershop-create.dto.js";

export class BarbershopPatchDto extends PartialType(
  OmitType(BarbershopCreateDto, ["ownerId"] as const),
) {}
