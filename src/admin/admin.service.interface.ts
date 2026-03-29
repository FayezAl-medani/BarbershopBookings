import { AdminEntity } from "./entities/admin.entity.js";
import { AdminCreateDto } from "./dto/request/admin-create.dto.js";
import { AdminRegisterDto } from "./dto/request/admin-register.dto.js";
import { AdminFilterDto } from "./dto/request/admin-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { MessageResponseDto } from "../common/dto/status.dto.js";

export const ADMIN_SERVICE = "IAdminService";

export interface IAdminService {
  registerAdminUser(payload: AdminRegisterDto): Promise<AdminEntity>;
  create(payload: AdminCreateDto): Promise<AdminEntity>;
  findAllPaging(
    filter: AdminFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<AdminEntity>>;
  getById(id: string): Promise<AdminEntity>;
  getByUserId(userId: string): Promise<AdminEntity>;
  getByEmail(email: string): Promise<AdminEntity>;
  remove(id: string): Promise<MessageResponseDto>;
}
