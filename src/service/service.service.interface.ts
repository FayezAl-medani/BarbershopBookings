import { ServiceEntity } from './entities/service.entity.js';
import { ServiceCreateDto } from './dto/request/service-create.dto.js';
import { ServiceFilterDto } from './dto/request/service-filter.dto.js';
import { ServicePatchDto } from './dto/request/service-patch.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { SortingParam } from '../common/decorators/sorting-params.decorator.js';
import { IPaginatedResult } from '../common/dto/paging-data-response.dto.js';
import { MessageResponseDto } from '../common/dto/status.dto.js';

export const SERVICE_SERVICE = 'IServiceService';

export interface IServiceService {
  create(payload: ServiceCreateDto): Promise<ServiceEntity>;
  findAllPaging(filter: ServiceFilterDto, pagingArgs?: PaginationParams, sort?: SortingParam | null): Promise<IPaginatedResult<ServiceEntity>>;
  getById(id: string): Promise<ServiceEntity>;
  update(id: string, payload: ServicePatchDto): Promise<ServiceEntity>;
  remove(id: string): Promise<MessageResponseDto>;
}
