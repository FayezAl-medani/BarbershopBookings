import { PartialType } from "@nestjs/swagger";
import { AdminCreateDto } from "./admin-create.dto.js";

export class AdminPatchDto extends PartialType(AdminCreateDto) {}
