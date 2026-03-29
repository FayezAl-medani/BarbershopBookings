import { PartialType } from "@nestjs/swagger";
import { TokenCreateDto } from "./token-create.dto.js";

export class TokenPatchDto extends PartialType(TokenCreateDto) {}
