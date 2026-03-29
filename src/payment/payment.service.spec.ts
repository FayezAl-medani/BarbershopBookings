import { PaymentService } from "./payment.service";

const mockPaymentRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByBookingId: jest.fn(),
  findAllPaging: jest.fn(),
  updateById: jest.fn(),
};

const mockPaymentMapper = {
  modelToEntity: jest.fn((m) => ({ ...m, amount: Number(m.amount) })),
};

const mockBookingRepository = {
  findById: jest.fn(),
  updateById: jest.fn(),
};

describe("PaymentService", () => {
  let service: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentService(
      mockPaymentRepository as any,
      mockPaymentMapper as any,
      mockBookingRepository as any,
    );
  });

  describe("create", () => {
    it("should create a payment for a valid booking", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        totalPrice: 100,
      });
      mockPaymentRepository.findByBookingId.mockResolvedValue([]);
      mockPaymentRepository.create.mockImplementation((data) => ({
        id: "payment1",
        ...data,
      }));

      await service.create({
        bookingId: "booking1",
        amount: 100,
        type: "FULL" as any,
        method: "CASH" as any,
      });

      expect(mockPaymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: "booking1",
          amount: 100,
          type: "FULL",
          method: "CASH",
          status: "PENDING",
        }),
      );
    });

    it("should reject payment exceeding booking total", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        totalPrice: 50,
      });
      mockPaymentRepository.findByBookingId.mockResolvedValue([]);

      await expect(
        service.create({
          bookingId: "booking1",
          amount: 100,
          type: "FULL" as any,
          method: "CASH" as any,
        }),
      ).rejects.toThrow("exceeds booking total");
    });

    it("should reject when total payments exceed booking price", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        totalPrice: 100,
      });
      mockPaymentRepository.findByBookingId.mockResolvedValue([
        { id: "pay1", status: "SUCCESS", type: "DEPOSIT", amount: 50 },
      ]);

      await expect(
        service.create({
          bookingId: "booking1",
          amount: 60,
          type: "FULL" as any,
          method: "CASH" as any,
        }),
      ).rejects.toThrow("exceeds booking total");
    });

    it("should create deposit and update booking", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        totalPrice: 100,
      });
      mockPaymentRepository.findByBookingId.mockResolvedValue([]);
      mockPaymentRepository.create.mockImplementation((data) => ({
        id: "payment1",
        ...data,
      }));

      await service.create({
        bookingId: "booking1",
        amount: 30,
        type: "DEPOSIT" as any,
        method: "VISA" as any,
      });

      expect(mockBookingRepository.updateById).toHaveBeenCalledWith(
        "booking1",
        expect.objectContaining({
          depositPaid: true,
          paymentStatus: "PARTIALLY_PAID",
          paymentMethod: "VISA",
        }),
      );
    });

    it("should throw when booking not found", async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(
        service.create({
          bookingId: "nonexistent",
          amount: 50,
          type: "FULL" as any,
          method: "CASH" as any,
        }),
      ).rejects.toThrow("Booking not found");
    });
  });

  describe("markAsSuccess", () => {
    it("should mark payment as success and update booking to PAID when full amount", async () => {
      mockPaymentRepository.findById.mockResolvedValue({
        id: "payment1",
        bookingId: "booking1",
        status: "PENDING",
        type: "FULL",
        amount: 100,
      });
      mockPaymentRepository.updateById.mockImplementation((id, data) => ({
        id,
        ...data,
        amount: 100,
        bookingId: "booking1",
      }));
      mockPaymentRepository.findByBookingId.mockResolvedValue([
        { id: "payment1", status: "PENDING", type: "FULL", amount: 100 },
      ]);
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        totalPrice: 100,
      });

      await service.markAsSuccess("payment1");

      expect(mockBookingRepository.updateById).toHaveBeenCalledWith(
        "booking1",
        expect.objectContaining({ paymentStatus: "PAID" }),
      );
    });

    it("should reject marking non-pending payment", async () => {
      mockPaymentRepository.findById.mockResolvedValue({
        id: "payment1",
        status: "SUCCESS",
      });

      await expect(service.markAsSuccess("payment1")).rejects.toThrow();
    });
  });

  describe("refund", () => {
    it("should create refund record for successful payment", async () => {
      mockPaymentRepository.findById.mockResolvedValue({
        id: "payment1",
        bookingId: "booking1",
        status: "SUCCESS",
        amount: 50,
        method: "VISA",
      });
      mockPaymentRepository.create.mockImplementation((data) => ({
        id: "refund1",
        ...data,
      }));
      mockPaymentRepository.updateById.mockResolvedValue({});
      mockBookingRepository.updateById.mockResolvedValue({});

      await service.refund("payment1");

      expect(mockPaymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: "booking1",
          amount: 50,
          type: "REFUND",
          method: "VISA",
          status: "SUCCESS",
        }),
      );
      expect(mockBookingRepository.updateById).toHaveBeenCalledWith(
        "booking1",
        expect.objectContaining({ paymentStatus: "REFUNDED" }),
      );
    });

    it("should reject refund on non-success payment", async () => {
      mockPaymentRepository.findById.mockResolvedValue({
        id: "payment1",
        status: "PENDING",
      });

      await expect(service.refund("payment1")).rejects.toThrow();
    });
  });
});
