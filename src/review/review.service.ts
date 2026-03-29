import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { IReviewService } from "./review.service.interface.js";
import { ReviewRepository } from "./review.repository.js";
import { ReviewMapper } from "./mappers/review.mapper.js";
import { ReviewEntity } from "./entities/review.entity.js";
import { ReviewCreateDto } from "./dto/request/review-create.dto.js";
import { ReviewFilterDto } from "./dto/request/review-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import {
  MessageResponseDto,
  SuccessResponseDto,
} from "../common/dto/status.dto.js";
import { BookingRepository } from "../booking/booking.repository.js";

@Injectable()
export class ReviewService implements IReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewMapper: ReviewMapper,
    private readonly bookingRepository: BookingRepository,
    private readonly i18nService: I18nService,
  ) {}

  async create(payload: ReviewCreateDto): Promise<ReviewEntity> {
    // Verify booking exists and is completed
    const booking = await this.bookingRepository.findById(payload.bookingId);
    if (!booking) {
      throw new NotFoundException(
        this.i18nService.translate("errors.BOOKING.NOT_FOUND"),
      );
    }

    if (booking.status !== "COMPLETED") {
      throw new BadRequestException(
        this.i18nService.translate("errors.REVIEW.BOOKING_NOT_COMPLETED"),
      );
    }

    // Verify the customer owns this booking
    if (booking.customerId !== payload.customerId) {
      throw new BadRequestException(
        this.i18nService.translate("errors.REVIEW.NOT_YOUR_BOOKING"),
      );
    }

    // Check for existing review on this booking
    const existing = await this.reviewRepository.findByBookingId(
      payload.bookingId,
    );
    if (existing) {
      throw new ConflictException(
        this.i18nService.translate("errors.REVIEW.ALREADY_EXISTS"),
      );
    }

    const review = await this.reviewRepository.create(payload);
    return this.reviewMapper.modelToEntity(review);
  }

  async findAllPaging(
    filter: ReviewFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<ReviewEntity>> {
    const result = await this.reviewRepository.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const data = result.data.map((res) => this.reviewMapper.modelToEntity(res));
    return new PagingDataResponseDto(data, result.meta);
  }

  async getById(id: string): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException(
        this.i18nService.translate("errors.REVIEW.NOT_FOUND"),
      );
    }
    return this.reviewMapper.modelToEntity(review);
  }

  async remove(id: string): Promise<MessageResponseDto> {
    await this.getById(id);
    await this.reviewRepository.deleteById(id);
    return new SuccessResponseDto(
      this.i18nService.translate("messages.REVIEW.DELETED"),
    );
  }
}
