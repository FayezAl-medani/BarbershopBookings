import { CustomerEntity } from './entities/customer.entity.js';
import { CustomerCreateDto } from './dto/request/customer-create.dto.js';
import { CustomerFilterDto } from './dto/request/customer-filter.dto.js';
import { CustomerPatchDto } from './dto/request/customer-patch.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { IPaginatedResult } from '../common/dto/paging-data-response.dto.js';
import { MessageResponseDto } from '../common/dto/status.dto.js';

export const CUSTOMER_SERVICE = 'ICustomerService';

export interface ICustomerService {
  create(payload: CustomerCreateDto): Promise<CustomerEntity>;
  findAllPaging(filter: CustomerFilterDto, pagingArgs?: PaginationParams): Promise<IPaginatedResult<CustomerEntity>>;
  getById(id: string): Promise<CustomerEntity>;
  getByUserId(userId: string): Promise<CustomerEntity>;
  update(id: string, payload: CustomerPatchDto): Promise<CustomerEntity>;
  remove(id: string): Promise<MessageResponseDto>;
}
