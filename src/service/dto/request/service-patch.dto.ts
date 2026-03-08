import { PartialType } from '@nestjs/swagger';
import { ServiceCreateDto } from './service-create.dto.js';

export class ServicePatchDto extends PartialType(ServiceCreateDto) {}
