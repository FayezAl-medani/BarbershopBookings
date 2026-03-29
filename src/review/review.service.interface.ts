import { ReviewEntity } from "./entities/review.entity.js";
import { ReviewCreateDto } from "./dto/request/review-create.dto.js";
import { ReviewFilterDto } from "./dto/request/review-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { MessageResponseDto } from "../common/dto/status.dto.js";

export const REVIEW_SERVICE = "IReviewService";

export interface IReviewService {
  create(payload: ReviewCreateDto): Promise<ReviewEntity>;
  findAllPaging(
    filter: ReviewFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<ReviewEntity>>;
  getById(id: string): Promise<ReviewEntity>;
  remove(id: string): Promise<MessageResponseDto>;
}
