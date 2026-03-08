import { PartialType, OmitType } from '@nestjs/swagger';
import { BarberCreateDto } from './barber-create.dto.js';

export class BarberPatchDto extends PartialType(OmitType(BarberCreateDto, ['userId'] as const)) {}
