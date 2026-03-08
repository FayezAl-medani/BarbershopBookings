import { BarberEntity } from './entities/barber.entity.js';
import { BarberCreateDto } from './dto/request/barber-create.dto.js';
import { BarberFilterDto } from './dto/request/barber-filter.dto.js';
import { BarberPatchDto } from './dto/request/barber-patch.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { SortingParam } from '../common/decorators/sorting-params.decorator.js';
import { IPaginatedResult } from '../common/dto/paging-data-response.dto.js';
import { MessageResponseDto } from '../common/dto/status.dto.js';

export const BARBER_SERVICE = 'IBarberService';

export interface IBarberService {
  create(payload: BarberCreateDto): Promise<BarberEntity>;
  findAllPaging(
    filter: BarberFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<BarberEntity>>;
  getById(id: string): Promise<BarberEntity>;
  getByUserId(userId: string): Promise<BarberEntity>;
  update(id: string, payload: BarberPatchDto): Promise<BarberEntity>;
  remove(id: string): Promise<MessageResponseDto>;
}
