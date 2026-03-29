import { SubscriptionService } from "./subscription.service";

const mockSubscriptionRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findActiveByBarbershopId: jest.fn(),
  findAllPaging: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
};

const mockSubscriptionMapper = {
  modelToEntity: jest.fn((m) => ({ ...m, amount: Number(m.amount) })),
};

const mockI18nService = {
  translate: jest.fn((key) => key),
};

describe("SubscriptionService", () => {
  let service: SubscriptionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SubscriptionService(
      mockSubscriptionRepository as any,
      mockSubscriptionMapper as any,
      mockI18nService as any,
    );
  });

  describe("create", () => {
    it("should create a subscription", async () => {
      mockSubscriptionRepository.findActiveByBarbershopId.mockResolvedValue(
        null,
      );
      mockSubscriptionRepository.create.mockImplementation((data) => ({
        id: "sub1",
        ...data,
        status: "ACTIVE",
      }));

      await service.create({
        barbershopId: "shop1",
        planName: "Basic Monthly",
        amount: 500,
        startDate: "2026-01-01",
        endDate: "2026-02-01",
      });

      expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          barbershopId: "shop1",
          planName: "Basic Monthly",
          amount: 500,
          currency: "SAR",
          autoRenew: true,
        }),
      );
    });

    it("should reject when shop already has active subscription", async () => {
      mockSubscriptionRepository.findActiveByBarbershopId.mockResolvedValue({
        id: "existing",
        status: "ACTIVE",
      });

      await expect(
        service.create({
          barbershopId: "shop1",
          planName: "Basic",
          amount: 500,
          startDate: "2026-01-01",
          endDate: "2026-02-01",
        }),
      ).rejects.toThrow("already has an active subscription");
    });

    it("should reject when endDate before startDate", async () => {
      await expect(
        service.create({
          barbershopId: "shop1",
          planName: "Basic",
          amount: 500,
          startDate: "2026-02-01",
          endDate: "2026-01-01",
        }),
      ).rejects.toThrow("End date must be after start date");
    });
  });

  describe("cancel", () => {
    it("should cancel an active subscription", async () => {
      mockSubscriptionRepository.findById.mockResolvedValue({
        id: "sub1",
        status: "ACTIVE",
        amount: 500,
      });
      mockSubscriptionRepository.updateById.mockImplementation((id, _data) => ({
        id,
        status: "CANCELLED",
        autoRenew: false,
        amount: 500,
      }));

      await service.cancel("sub1");

      expect(mockSubscriptionRepository.updateById).toHaveBeenCalledWith(
        "sub1",
        expect.objectContaining({
          status: "CANCELLED",
          autoRenew: false,
        }),
      );
    });

    it("should reject cancelling already cancelled subscription", async () => {
      mockSubscriptionRepository.findById.mockResolvedValue({
        id: "sub1",
        status: "CANCELLED",
        amount: 500,
      });

      await expect(service.cancel("sub1")).rejects.toThrow("already cancelled");
    });
  });
});
