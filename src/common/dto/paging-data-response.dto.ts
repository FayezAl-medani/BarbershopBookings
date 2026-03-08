import { ApiProperty } from '@nestjs/swagger';
import { type IPagingMeta, PagingMeta } from './paging-meta.dto.js';
import { ResponseStatus } from '../enums/index.js';

export interface IPaginatedResult<T> {
  data: T[];
  meta: IPagingMeta;
}

export class PagingDataResponseDto<T> implements IPaginatedResult<T> {
  @ApiProperty({
    enum: ResponseStatus,
    example: ResponseStatus.SUCCESS,
    description: 'Response status indicator',
  })
  status: ResponseStatus;

  @ApiProperty({
    isArray: true,
    description: 'Array of data items',
  })
  data: T[];

  @ApiProperty({
    type: () => PagingMeta,
    description: 'Pagination metadata',
  })
  meta: PagingMeta;

  constructor(
    data: T[],
    meta: PagingMeta,
    status: ResponseStatus = ResponseStatus.SUCCESS,
  ) {
    this.status = status;
    this.data = data;
    this.meta = meta;
  }
}

export function createPagingDataResponse<T>(
  dataType: new (...args: any[]) => T,
) {
  class PagingDataResponse extends PagingDataResponseDto<T> {
    @ApiProperty({
      type: () => dataType,
      isArray: true,
      description: `Array of ${dataType.name} objects`,
    })
    declare data: T[];
  }

  Object.defineProperty(PagingDataResponse, 'name', {
    value: `${dataType.name}PagingData`,
    writable: false,
  });

  return PagingDataResponse;
}
