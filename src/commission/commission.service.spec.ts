import { CommissionService } from "./commission.service";

const mockCommissionRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByBookingId: jest.fn(),
  findAllPaging: jest.fn(),
  updateById: jest.fn(),
  getSummary: jest.fn(),
};

const mockCommissionMapper = {
  modelToEntity: jest.fn((m) => ({
    ...m,
    amount: Number(m.amount),
    commissionRate: Number(m.commissionRate),
  })),
};

const mockBookingRepository = {
  findById: jest.fn(),
};

const mockBarberRepository = {
  findById: jest.fn(),
};

const mockI18nService = {
  translate: jest.fn((key) => key),
};

describe("CommissionService", () => {
  let service: CommissionService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new CommissionService(
      mockCommissionRepository as any,
      mockCommissionMapper as any,
      mockBookingRepository as any,
      mockBarberRepository as any,
      mockI18nService as any,
    );
  });

  describe("createFromBooking", () => {
    it("should calculate commission correctly", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        barberId: "barber1",
        totalPrice: 100,
      });
      mockBarberRepository.findById.mockResolvedValue({
        id: "barber1",
        commissionRate: 0.15, // 15%
      });
      mockCommissionRepository.create.mockImplementation((data) => ({
        id: "commission1",
        ...data,
      }));

      await service.createFromBooking("booking1");

      expect(mockCommissionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          barberId: "barber1",
          bookingId: "booking1",
          amount: 15, // 100 * 0.15
          commissionRate: 0.15,
          status: "PENDING",
        }),
      );
    });

    it("should handle decimal commission rates correctly", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        barberId: "barber1",
        totalPrice: 75.5,
      });
      mockBarberRepository.findById.mockResolvedValue({
        id: "barber1",
        commissionRate: 0.2, // 20%
      });
      mockCommissionRepository.create.mockImplementation((data) => ({
        id: "commission1",
        ...data,
      }));

      await service.createFromBooking("booking1");

      const callArgs = mockCommissionRepository.create.mock.calls[0][0];
      expect(callArgs.commissionRate).toBe(0.2);
      expect(callArgs.amount).toBeCloseTo(15.1, 2); // 75.50 * 0.2 ≈ 15.1
    });

    it("should throw when booking not found", async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(service.createFromBooking("nonexistent")).rejects.toThrow();
    });

    it("should throw when barber has no commission rate", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        barberId: "barber1",
        totalPrice: 100,
      });
      mockBarberRepository.findById.mockResolvedValue({
        id: "barber1",
        commissionRate: null,
      });

      await expect(service.createFromBooking("booking1")).rejects.toThrow();
    });

    it("should throw when barber not found", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        barberId: "barber1",
        totalPrice: 100,
      });
      mockBarberRepository.findById.mockResolvedValue(null);

      await expect(service.createFromBooking("booking1")).rejects.toThrow();
    });
  });

  describe("collect", () => {
    it("should mark commission as collected", async () => {
      mockCommissionRepository.findById.mockResolvedValue({
        id: "commission1",
        status: "PENDING",
        amount: 15,
      });
      mockCommissionRepository.updateById.mockImplementation((id, data) => ({
        id,
        status: data.status,
        amount: 15,
        collectedAt: data.collectedAt,
        collectedById: data.collectedById,
      }));

      await service.collect("commission1", "admin1");

      expect(mockCommissionRepository.updateById).toHaveBeenCalledWith(
        "commission1",
        expect.objectContaining({
          status: "COLLECTED",
          collectedById: "admin1",
        }),
      );
    });

    it("should reject collecting already collected commission", async () => {
      mockCommissionRepository.findById.mockResolvedValue({
        id: "commission1",
        status: "COLLECTED",
      });

      await expect(service.collect("commission1", "admin1")).rejects.toThrow();
    });

    it("should throw when commission not found", async () => {
      mockCommissionRepository.findById.mockResolvedValue(null);

      await expect(service.collect("nonexistent", "admin1")).rejects.toThrow();
    });
  });

  describe("getSummary", () => {
    it("should return aggregated summary", async () => {
      mockCommissionRepository.getSummary.mockResolvedValue({
        totalPending: 150.5,
        totalCollected: 300.25,
        pendingCount: 5,
        collectedCount: 10,
      });

      const result = await service.getSummary();

      expect(result).toEqual({
        totalPending: 150.5,
        totalCollected: 300.25,
        pendingCount: 5,
        collectedCount: 10,
      });
    });
  });

  describe("getById", () => {
    it("should return commission entity", async () => {
      mockCommissionRepository.findById.mockResolvedValue({
        id: "commission1",
        amount: 15,
        commissionRate: 0.15,
        status: "PENDING",
      });

      const result = await service.getById("commission1");
      expect(result).toBeDefined();
      expect(result.amount).toBe(15);
    });

    it("should throw when not found", async () => {
      mockCommissionRepository.findById.mockResolvedValue(null);

      await expect(service.getById("nonexistent")).rejects.toThrow();
    });
  });
});
