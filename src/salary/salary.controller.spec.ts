import { ForbiddenException } from "@nestjs/common";
import { SalaryController } from "./salary.controller";
import { RoleName } from "../common/enums/role-name.enum";

const mockSalaryService = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  markAsPaid: jest.fn(),
  findAllPaging: jest.fn(),
};

const mockBarberService = {
  getById: jest.fn(),
};

const mockSalaryMapper = {
  entityToResponseDto: jest.fn((e) => e),
};

describe("SalaryController", () => {
  let controller: SalaryController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SalaryController(
      mockSalaryService as any,
      mockBarberService as any,
      mockSalaryMapper as any,
    );
  });

  const ownerUser = {
    loggedInAs: RoleName.BARBERSHOP_OWNER,
    barbershopId: "shop1",
  } as any;

  const adminUser = {
    loggedInAs: RoleName.ADMIN,
  } as any;

  describe("create — assertBarberOwnership", () => {
    it("should allow ADMIN to create salary for any barber", async () => {
      mockSalaryService.create.mockResolvedValue({
        id: "salary1",
        barberId: "barber1",
      });

      await controller.create({ barberId: "barber1" } as any, adminUser);

      expect(mockSalaryService.create).toHaveBeenCalled();
      // barberService.getById should NOT be called for admin
      expect(mockBarberService.getById).not.toHaveBeenCalled();
    });

    it("should allow BARBERSHOP_OWNER to create salary for own barber", async () => {
      mockBarberService.getById.mockResolvedValue({
        id: "barber1",
        barbershopId: "shop1",
      });
      mockSalaryService.create.mockResolvedValue({
        id: "salary1",
        barberId: "barber1",
      });

      await controller.create({ barberId: "barber1" } as any, ownerUser);

      expect(mockSalaryService.create).toHaveBeenCalled();
    });

    it("should reject BARBERSHOP_OWNER creating salary for another shop's barber", async () => {
      mockBarberService.getById.mockResolvedValue({
        id: "barber1",
        barbershopId: "shop-other",
      });

      await expect(
        controller.create({ barberId: "barber1" } as any, ownerUser),
      ).rejects.toThrow(ForbiddenException);
      expect(mockSalaryService.create).not.toHaveBeenCalled();
    });
  });

  describe("findOne — ownership isolation", () => {
    it("should allow ADMIN to view any salary", async () => {
      mockSalaryService.getById.mockResolvedValue({
        id: "salary1",
        barberId: "barber1",
      });

      await controller.findOne("salary1", adminUser);

      expect(mockBarberService.getById).not.toHaveBeenCalled();
    });

    it("should allow BARBERSHOP_OWNER to view salary for own barber", async () => {
      mockSalaryService.getById.mockResolvedValue({
        id: "salary1",
        barberId: "barber1",
      });
      mockBarberService.getById.mockResolvedValue({
        id: "barber1",
        barbershopId: "shop1",
      });

      await controller.findOne("salary1", ownerUser);

      expect(mockBarberService.getById).toHaveBeenCalledWith("barber1");
    });

    it("should reject BARBERSHOP_OWNER viewing salary for another shop's barber", async () => {
      mockSalaryService.getById.mockResolvedValue({
        id: "salary1",
        barberId: "barber1",
      });
      mockBarberService.getById.mockResolvedValue({
        id: "barber1",
        barbershopId: "shop-other",
      });

      await expect(controller.findOne("salary1", ownerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("markAsPaid — ownership isolation", () => {
    it("should reject BARBERSHOP_OWNER marking salary paid for another shop's barber", async () => {
      mockSalaryService.getById.mockResolvedValue({
        id: "salary1",
        barberId: "barber1",
      });
      mockBarberService.getById.mockResolvedValue({
        id: "barber1",
        barbershopId: "shop-other",
      });

      await expect(controller.markAsPaid("salary1", ownerUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockSalaryService.markAsPaid).not.toHaveBeenCalled();
    });
  });

  describe("findAll — enforceTenantScope", () => {
    it("should force barbershopId filter for BARBERSHOP_OWNER", async () => {
      mockSalaryService.findAllPaging.mockResolvedValue({
        data: [],
        meta: { total: 0 },
      });

      const filter = {} as any;
      await controller.findAll(
        filter,
        { page: 1, perPage: 10 } as any,
        null,
        ownerUser,
      );

      expect(filter.barbershopId).toBe("shop1");
    });

    it("should not modify filter for ADMIN", async () => {
      mockSalaryService.findAllPaging.mockResolvedValue({
        data: [],
        meta: { total: 0 },
      });

      const filter = {} as any;
      await controller.findAll(
        filter,
        { page: 1, perPage: 10 } as any,
        null,
        adminUser,
      );

      expect(filter.barbershopId).toBeUndefined();
    });

    it("should throw if BARBERSHOP_OWNER has no barbershopId", async () => {
      const ownerWithoutShop = {
        loggedInAs: RoleName.BARBERSHOP_OWNER,
        barbershopId: undefined,
      } as any;

      await expect(
        controller.findAll(
          {} as any,
          { page: 1, perPage: 10 } as any,
          null,
          ownerWithoutShop,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
