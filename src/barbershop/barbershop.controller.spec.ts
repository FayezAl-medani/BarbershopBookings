import { ForbiddenException } from "@nestjs/common";
import { BarbershopController } from "./barbershop.controller";
import { RoleName } from "../common/enums/role-name.enum";

const mockBarbershopService = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findAllPaging: jest.fn(),
};

const mockBarbershopMapper = {
  entityToResponseDto: jest.fn((e) => e),
};

describe("BarbershopController", () => {
  let controller: BarbershopController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new BarbershopController(
      mockBarbershopService as any,
      mockBarbershopMapper as any,
    );
  });

  describe("update — ownership check", () => {
    const payload = { name: "Updated Name" } as any;

    it("should allow SUPER_ADMIN to update any barbershop", async () => {
      const user = {
        loggedInAs: RoleName.SUPER_ADMIN,
        barbershopId: "shop-other",
      } as any;

      mockBarbershopService.update.mockResolvedValue({ id: "shop1" });

      await controller.update("shop1", payload, user);

      expect(mockBarbershopService.update).toHaveBeenCalledWith(
        "shop1",
        payload,
      );
    });

    it("should allow BARBERSHOP_OWNER to update their own shop", async () => {
      const user = {
        loggedInAs: RoleName.BARBERSHOP_OWNER,
        barbershopId: "shop1",
      } as any;

      mockBarbershopService.update.mockResolvedValue({ id: "shop1" });

      await controller.update("shop1", payload, user);

      expect(mockBarbershopService.update).toHaveBeenCalledWith(
        "shop1",
        payload,
      );
    });

    it("should reject BARBERSHOP_OWNER updating another shop", async () => {
      const user = {
        loggedInAs: RoleName.BARBERSHOP_OWNER,
        barbershopId: "shop1",
      } as any;

      await expect(
        controller.update("shop-other", payload, user),
      ).rejects.toThrow(ForbiddenException);
      expect(mockBarbershopService.update).not.toHaveBeenCalled();
    });
  });
});
