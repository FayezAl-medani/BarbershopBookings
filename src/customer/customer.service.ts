import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ICustomerService } from './customer.service.interface.js';
import { CustomerRepository } from './customer.repository.js';
import { CustomerMapper } from './mappers/customer.mapper.js';
import { CustomerEntity } from './entities/customer.entity.js';
import { CustomerCreateDto } from './dto/request/customer-create.dto.js';
import { CustomerFilterDto } from './dto/request/customer-filter.dto.js';
import { CustomerPatchDto } from './dto/request/customer-patch.dto.js';
import { PaginationParams } from '../common/dto/pagination-params.dto.js';
import { IPaginatedResult } from '../common/dto/paging-data-response.dto.js';
import { PagingDataResponseDto } from '../common/dto/paging-data-response.dto.js';
import { MessageResponseDto, SuccessResponseDto } from '../common/dto/status.dto.js';

@Injectable()
export class CustomerService implements ICustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerMapper: CustomerMapper,
    private readonly i18nService: I18nService,
  ) {}

  async create(payload: CustomerCreateDto): Promise<CustomerEntity> {
    const customer = await this.customerRepository.create(payload);
    return this.customerMapper.modelToEntity(customer);
  }

  async findAllPaging(
    filter: CustomerFilterDto,
    pagingArgs?: PaginationParams,
  ): Promise<IPaginatedResult<CustomerEntity>> {
    const result = await this.customerRepository.findAllPaging(filter, pagingArgs);
    const data = result.data.map((res) => this.customerMapper.modelToEntity(res));
    return new PagingDataResponseDto(data, result.meta);
  }

  async getById(id: string): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(
        this.i18nService.translate('errors.CUSTOMER.NOT_FOUND'),
      );
    }
    return this.customerMapper.modelToEntity(customer);
  }

  async getByUserId(userId: string): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException(
        this.i18nService.translate('errors.CUSTOMER.NOT_FOUND'),
      );
    }
    return this.customerMapper.modelToEntity(customer);
  }

  async update(id: string, payload: CustomerPatchDto): Promise<CustomerEntity> {
    await this.getById(id);
    const updated = await this.customerRepository.updateById(id, payload);
    return this.customerMapper.modelToEntity(updated);
  }

  async remove(id: string): Promise<MessageResponseDto> {
    await this.getById(id);
    await this.customerRepository.deleteById(id);
    return new SuccessResponseDto('Customer deleted successfully');
  }
}
