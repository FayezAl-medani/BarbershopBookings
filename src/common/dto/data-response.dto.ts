import { ApiProperty } from '@nestjs/swagger';
import { ResponseStatus } from '../enums/index.js';

export class DataResponseDto<T> {
  @ApiProperty({
    enum: ResponseStatus,
    example: ResponseStatus.SUCCESS,
    description: 'Response status indicator',
  })
  status: ResponseStatus;

  @ApiProperty({
    description: 'The data payload',
  })
  data: T;

  constructor(data: T, status: ResponseStatus = ResponseStatus.SUCCESS) {
    this.status = status;
    this.data = data;
  }
}

export function createDataResponse<T>(dataType: new (...args: any[]) => T) {
  class DataResponse extends DataResponseDto<T> {
    @ApiProperty({
      type: () => dataType,
      description: `${dataType.name} data object`,
    })
    declare data: T;
  }

  Object.defineProperty(DataResponse, 'name', {
    value: `${dataType.name}Data`,
    writable: false,
  });

  return DataResponse;
}

export class DataArrayResponseDto<T> {
  @ApiProperty({
    enum: ResponseStatus,
    example: ResponseStatus.SUCCESS,
    description: 'Response status indicator',
  })
  status: ResponseStatus;

  @ApiProperty({
    description: 'The data payload',
  })
  data: T[];

  @ApiProperty({ type: Number })
  totalResults: number;

  constructor(data: T[]) {
    this.status = ResponseStatus.SUCCESS;
    this.data = data;
    this.totalResults = data.length;
  }
}

export function createDataArrayResponse<T>(
  dataType: new (...args: any[]) => T,
) {
  class DataArrayResponse extends DataArrayResponseDto<T> {
    @ApiProperty({
      type: () => dataType,
      isArray: true,
      description: `Array of ${dataType.name} data objects`,
    })
    declare data: T[];
  }

  Object.defineProperty(DataArrayResponse, 'name', {
    value: `${dataType.name}ArrayData`,
    writable: false,
  });

  return DataArrayResponse;
}
