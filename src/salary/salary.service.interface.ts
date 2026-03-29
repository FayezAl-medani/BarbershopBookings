import { SalaryEntity } from "./entities/salary.entity.js";
import { SalaryCreateDto } from "./dto/request/salary-create.dto.js";
import { SalaryPatchDto } from "./dto/request/salary-patch.dto.js";
import { SalaryFilterDto } from "./dto/request/salary-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { MessageResponseDto } from "../common/dto/status.dto.js";

export const SALARY_SERVICE = "ISalaryService";

export interface ISalaryService {
  create(payload: SalaryCreateDto): Promise<SalaryEntity>;
  findAllPaging(
    filter: SalaryFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<SalaryEntity>>;
  getById(id: string): Promise<SalaryEntity>;
  update(id: string, payload: SalaryPatchDto): Promise<SalaryEntity>;
  markAsPaid(id: string): Promise<SalaryEntity>;
  remove(id: string): Promise<MessageResponseDto>;
}
