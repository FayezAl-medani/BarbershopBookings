import { Module } from "@nestjs/common";
import { ReviewController } from "./review.controller.js";
import { ReviewService } from "./review.service.js";
import { ReviewRepository } from "./review.repository.js";
import { ReviewMapper } from "./mappers/review.mapper.js";
import { REVIEW_SERVICE } from "./review.service.interface.js";
import { BookingModule } from "../booking/booking.module.js";

@Module({
  imports: [BookingModule],
  controllers: [ReviewController],
  providers: [
    ReviewRepository,
    ReviewMapper,
    {
      provide: REVIEW_SERVICE,
      useClass: ReviewService,
    },
  ],
  exports: [REVIEW_SERVICE, ReviewRepository, ReviewMapper],
})
export class ReviewModule {}
