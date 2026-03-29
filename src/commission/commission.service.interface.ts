import { CommissionEntity } from "./entities/commission.entity.js";
import { CommissionFilterDto } from "./dto/request/commission-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { CommissionSummaryResponseDto } from "./dto/response/commission-summary-response.dto.js";

export const COMMISSION_SERVICE = "ICommissionService";

export interface ICommissionService {
  createFromBooking(bookingId: string): Promise<CommissionEntity>;
  findAllPaging(
    filter: CommissionFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<CommissionEntity>>;
  getById(id: string): Promise<CommissionEntity>;
  collect(id: string, collectedById: string): Promise<CommissionEntity>;
  getSummary(): Promise<CommissionSummaryResponseDto>;
}
