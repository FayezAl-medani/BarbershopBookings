import { SalaryService } from "./salary.service";
import { SalaryTypeDto } from "./dto/request/salary-create.dto";

const mockSalaryRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAllPaging: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
  getSummaryByBarber: jest.fn(),
};

const mockSalaryMapper = {
  modelToEntity: jest.fn((m) => ({ ...m, amount: Number(m.amount) })),
};

const mockI18nService = {
  translate: jest.fn((key) => key),
};

describe("SalaryService", () => {
  let service: SalaryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SalaryService(
      mockSalaryRepository as any,
      mockSalaryMapper as any,
      mockI18nService as any,
    );
  });

  describe("create", () => {
    it("should create a salary record", async () => {
      const payload = {
        barberId: "barber1",
        type: SalaryTypeDto.FIXED,
        amount: 3000,
        periodStart: "2026-01-01",
        periodEnd: "2026-01-31",
      };

      mockSalaryRepository.create.mockImplementation((data) => ({
        id: "salary1",
        ...data,
        isPaid: false,
      }));

      await service.create(payload);

      expect(mockSalaryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          barberId: "barber1",
          type: "FIXED",
          amount: 3000,
          currency: "SAR",
        }),
      );
    });

    it("should reject when periodEnd is before periodStart", async () => {
      const payload = {
        barberId: "barber1",
        type: SalaryTypeDto.FIXED,
        amount: 3000,
        periodStart: "2026-02-01",
        periodEnd: "2026-01-01",
      };

      await expect(service.create(payload)).rejects.toThrow(
        "Period end must be after period start",
      );
    });
  });

  describe("markAsPaid", () => {
    it("should mark salary as paid with timestamp", async () => {
      mockSalaryRepository.findById.mockResolvedValue({
        id: "salary1",
        isPaid: false,
        amount: 3000,
      });
      mockSalaryRepository.updateById.mockImplementation((id, data) => ({
        id,
        isPaid: true,
        paidAt: data.paidAt,
        amount: 3000,
      }));

      await service.markAsPaid("salary1");

      expect(mockSalaryRepository.updateById).toHaveBeenCalledWith(
        "salary1",
        expect.objectContaining({
          isPaid: true,
          paidAt: expect.any(Date),
        }),
      );
    });

    it("should reject if already paid", async () => {
      mockSalaryRepository.findById.mockResolvedValue({
        id: "salary1",
        isPaid: true,
        amount: 3000,
      });

      await expect(service.markAsPaid("salary1")).rejects.toThrow(
        "already marked as paid",
      );
    });
  });

  describe("remove", () => {
    it("should delete salary record", async () => {
      mockSalaryRepository.findById.mockResolvedValue({
        id: "salary1",
        amount: 3000,
      });
      mockSalaryRepository.deleteById.mockResolvedValue({ id: "salary1" });

      const result = await service.remove("salary1");

      expect(result.message).toContain("deleted");
    });

    it("should throw when salary not found", async () => {
      mockSalaryRepository.findById.mockResolvedValue(null);

      await expect(service.remove("nonexistent")).rejects.toThrow();
    });
  });
});
