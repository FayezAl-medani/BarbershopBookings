import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { IPaymentService } from "./payment.service.interface.js";
import { PaymentRepository } from "./payment.repository.js";
import { PaymentMapper } from "./mappers/payment.mapper.js";
import { PaymentEntity } from "./entities/payment.entity.js";
import { PaymentCreateDto } from "./dto/request/payment-create.dto.js";
import { PaymentFilterDto } from "./dto/request/payment-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import { PagingDataResponseDto } from "../common/dto/paging-data-response.dto.js";
import { BookingRepository } from "../booking/booking.repository.js";

@Injectable()
export class PaymentService implements IPaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentMapper: PaymentMapper,
    private readonly bookingRepository: BookingRepository,
  ) {}

  async create(payload: PaymentCreateDto): Promise<PaymentEntity> {
    const booking = await this.bookingRepository.findById(payload.bookingId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    // Validate amount doesn't exceed booking total
    if (payload.type !== "REFUND") {
      const existingPayments = await this.paymentRepository.findByBookingId(
        payload.bookingId,
      );
      const totalPaid = existingPayments
        .filter((p) => p.status === "SUCCESS" && p.type !== "REFUND")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      if (totalPaid + payload.amount > Number(booking.totalPrice)) {
        throw new BadRequestException(
          "Payment amount exceeds booking total price",
        );
      }
    }

    const payment = await this.paymentRepository.create({
      bookingId: payload.bookingId,
      amount: payload.amount,
      type: payload.type,
      method: payload.method,
      status: "PENDING",
      gatewayRef: payload.gatewayRef,
    });

    // Update booking payment status based on payment type
    if (payload.type === "DEPOSIT") {
      await this.bookingRepository.updateById(payload.bookingId, {
        depositPaid: true,
        paymentStatus: "PARTIALLY_PAID",
        paymentMethod: payload.method,
      } as any);
    }

    return this.paymentMapper.modelToEntity(payment);
  }

  async findAllPaging(
    filter: PaymentFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<PaymentEntity>> {
    const result = await this.paymentRepository.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    const data = result.data.map((res) =>
      this.paymentMapper.modelToEntity(res),
    );
    return new PagingDataResponseDto(data, result.meta);
  }

  async getById(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }
    return this.paymentMapper.modelToEntity(payment);
  }

  async getByBookingId(bookingId: string): Promise<PaymentEntity[]> {
    const payments = await this.paymentRepository.findByBookingId(bookingId);
    return payments.map((p) => this.paymentMapper.modelToEntity(p));
  }

  async markAsSuccess(id: string, gatewayRef?: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status !== "PENDING") {
      throw new BadRequestException(
        "Only pending payments can be marked as success",
      );
    }

    const updated = await this.paymentRepository.updateById(id, {
      status: "SUCCESS",
      ...(gatewayRef && { gatewayRef }),
    });

    // Update booking payment status
    const allPayments = await this.paymentRepository.findByBookingId(
      payment.bookingId,
    );
    const booking = await this.bookingRepository.findById(payment.bookingId);
    if (booking) {
      const totalPaid = allPayments
        .filter(
          (p) => (p.id === id || p.status === "SUCCESS") && p.type !== "REFUND",
        )
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const bookingTotal = Number(booking.totalPrice);
      if (totalPaid >= bookingTotal) {
        await this.bookingRepository.updateById(payment.bookingId, {
          paymentStatus: "PAID",
        } as any);
      }
    }

    return this.paymentMapper.modelToEntity(updated);
  }

  async markAsFailed(id: string, reason: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) throw new NotFoundException("Payment not found");

    const updated = await this.paymentRepository.updateById(id, {
      status: "FAILED",
      failureReason: reason,
    });
    return this.paymentMapper.modelToEntity(updated);
  }

  async refund(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status !== "SUCCESS") {
      throw new BadRequestException("Only successful payments can be refunded");
    }

    // Create a refund payment record
    const refund = await this.paymentRepository.create({
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      type: "REFUND",
      method: payment.method,
      status: "SUCCESS",
    });

    // Update original payment status
    await this.paymentRepository.updateById(id, { status: "REFUNDED" });

    // Update booking status
    await this.bookingRepository.updateById(payment.bookingId, {
      paymentStatus: "REFUNDED",
    } as any);

    return this.paymentMapper.modelToEntity(refund);
  }
}
