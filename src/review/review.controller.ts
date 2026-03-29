import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { REVIEW_SERVICE } from "./review.service.interface.js";
import type { IReviewService } from "./review.service.interface.js";
import { ReviewCreateDto } from "./dto/request/review-create.dto.js";
import { ReviewFilterDto } from "./dto/request/review-filter.dto.js";
import { ReviewResponseDto } from "./dto/response/review-response.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { DataResponseDto } from "../common/dto/data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import {
  ErrorResponseDto,
  MessageResponseDto,
} from "../common/dto/status.dto.js";
import {
  SortingParams,
  SortingParam,
} from "../common/decorators/sorting-params.decorator.js";
import { ApiSortingQuery } from "../common/decorators/sorting-params-swagger.decorator.js";
import {
  ApiDataResponse,
  ApiPaginatedResponse,
  ApiCreatedDataResponse,
  ApiMessageResponse,
} from "../common/decorators/response.decorator.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { Public } from "../common/decorators/public.decorator.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { RoleName } from "../common/enums/role-name.enum.js";
import { JwtPayloadWithAuth } from "../common/entities/index.js";
import { ReviewMapper } from "./mappers/review.mapper.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiBearerAuth("access-token")
@ApiTags("Review")
@Controller("review")
export class ReviewController {
  constructor(
    @Inject(REVIEW_SERVICE)
    private readonly reviewService: IReviewService,
    private readonly reviewMapper: ReviewMapper,
  ) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all reviews with pagination" })
  @ApiPaginatedResponse(ReviewResponseDto)
  @ApiSortingQuery(["rating", "createdAt"])
  async findAll(
    @Query() filter: ReviewFilterDto,
    @Query() pagingArgs: PaginationParams,
    @SortingParams(["rating", "createdAt"]) sort: SortingParam | null,
  ): Promise<PagingDataResponseDto<ReviewResponseDto>> {
    const result = await this.reviewService.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const mappedData = result.data.map((entity) =>
      this.reviewMapper.entityToResponseDto(entity),
    );
    return new PagingDataResponseDto(mappedData, result.meta);
  }

  @Get(":id")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get review by ID" })
  @ApiDataResponse(ReviewResponseDto)
  async findOne(
    @Param("id") id: string,
  ): Promise<DataResponseDto<ReviewResponseDto>> {
    const review = await this.reviewService.getById(id);
    return new DataResponseDto(this.reviewMapper.entityToResponseDto(review));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.CUSTOMER)
  @ApiOperation({ summary: "Create a review for a completed booking" })
  @ApiCreatedDataResponse(ReviewResponseDto)
  async create(
    @Body() payload: ReviewCreateDto,
    @CurrentUser() user: JwtPayloadWithAuth,
  ): Promise<DataResponseDto<ReviewResponseDto>> {
    // Force customerId from JWT — customers can only review as themselves
    if (user.customerId) {
      payload.customerId = user.customerId;
    }
    const review = await this.reviewService.create(payload);
    return new DataResponseDto(this.reviewMapper.entityToResponseDto(review));
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiMessageResponse()
  @ApiOperation({ summary: "Delete a review (moderation)" })
  async remove(@Param("id") id: string): Promise<MessageResponseDto> {
    return this.reviewService.remove(id);
  }
}
