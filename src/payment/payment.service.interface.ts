import { PaymentEntity } from "./entities/payment.entity.js";
import { PaymentCreateDto } from "./dto/request/payment-create.dto.js";
import { PaymentFilterDto } from "./dto/request/payment-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";

export const PAYMENT_SERVICE = "IPaymentService";

export interface IPaymentService {
  create(payload: PaymentCreateDto): Promise<PaymentEntity>;
  findAllPaging(
    filter: PaymentFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<PaymentEntity>>;
  getById(id: string): Promise<PaymentEntity>;
  getByBookingId(bookingId: string): Promise<PaymentEntity[]>;
  markAsSuccess(id: string, gatewayRef?: string): Promise<PaymentEntity>;
  markAsFailed(id: string, reason: string): Promise<PaymentEntity>;
  refund(id: string): Promise<PaymentEntity>;
}
