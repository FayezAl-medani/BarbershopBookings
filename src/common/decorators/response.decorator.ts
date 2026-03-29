import { Type, applyDecorators } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
} from "@nestjs/swagger";
import {
  DataArrayResponseDto,
  DataResponseDto,
  PagingDataResponseDto,
  PagingMeta,
  createDataArrayResponse,
  createDataResponse,
  createPagingDataResponse,
} from "../dto/index.js";
import { MessageResponseDto } from "../dto/status.dto.js";

export const ApiDataResponse = <TModel extends Type<any>>(model: TModel) => {
  const DataResponse = createDataResponse(model);

  return applyDecorators(
    ApiExtraModels(DataResponseDto),
    ApiOkResponse({
      type: DataResponse,
    }),
  );
};

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  const PagingDataResponse = createPagingDataResponse(model);

  return applyDecorators(
    ApiExtraModels(PagingMeta, PagingDataResponseDto),
    ApiOkResponse({
      type: PagingDataResponse,
    }),
  );
};

export const ApiCreatedDataResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  const DataResponse = createDataResponse(model);

  return applyDecorators(
    ApiExtraModels(DataResponseDto),
    ApiCreatedResponse({
      type: DataResponse,
    }),
  );
};

export const ApiMessageResponse = () => {
  return applyDecorators(ApiOkResponse({ type: MessageResponseDto }));
};

export const ApiDataArrayResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  const DataArrayResponse = createDataArrayResponse(model);

  return applyDecorators(
    ApiExtraModels(DataArrayResponseDto, model),
    ApiOkResponse({
      type: DataArrayResponse,
    }),
  );
};
