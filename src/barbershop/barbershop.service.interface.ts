import { BarbershopEntity } from "./entities/barbershop.entity.js";
import { BarbershopCreateDto } from "./dto/request/barbershop-create.dto.js";
import { BarbershopFilterDto } from "./dto/request/barbershop-filter.dto.js";
import { BarbershopPatchDto } from "./dto/request/barbershop-patch.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { MessageResponseDto } from "../common/dto/status.dto.js";

export const BARBERSHOP_SERVICE = "IBarbershopService";

export interface IBarbershopService {
  create(payload: BarbershopCreateDto): Promise<BarbershopEntity>;
  findAllPaging(
    filter: BarbershopFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<BarbershopEntity>>;
  getById(id: string): Promise<BarbershopEntity>;
  update(id: string, payload: BarbershopPatchDto): Promise<BarbershopEntity>;
  remove(id: string): Promise<MessageResponseDto>;
}
