import { PartialType, OmitType } from '@nestjs/swagger';
import { CustomerCreateDto } from './customer-create.dto.js';

export class CustomerPatchDto extends PartialType(OmitType(CustomerCreateDto, ['userId'] as const)) {}
