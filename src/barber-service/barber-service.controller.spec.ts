import { ForbiddenException } from "@nestjs/common";
import { BarberServiceController } from "./barber-service.controller";
import { RoleName } from "../common/enums/role-name.enum";

const mockBarberServiceService = {
  addServiceToBarber: jest.fn(),
  removeServiceFromBarber: jest.fn(),
  getBarberServices: jest.fn(),
};

describe("BarberServiceController", () => {
  let controller: BarberServiceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new BarberServiceController(mockBarberServiceService as any);
  });

  describe("addService — assertBarberSelf", () => {
    it("should allow ADMIN to add service to any barber", async () => {
      const user = { loggedInAs: RoleName.ADMIN } as any;
      mockBarberServiceService.addServiceToBarber.mockResolvedValue({
        barberId: "barber1",
        serviceId: "service1",
      });

      await controller.addService("barber1", "service1", user);

      expect(mockBarberServiceService.addServiceToBarber).toHaveBeenCalledWith(
        "barber1",
        "service1",
      );
    });

    it("should allow BARBER to add service to themselves", async () => {
      const user = {
        loggedInAs: RoleName.BARBER,
        barberId: "barber1",
      } as any;
      mockBarberServiceService.addServiceToBarber.mockResolvedValue({
        barberId: "barber1",
        serviceId: "service1",
      });

      await controller.addService("barber1", "service1", user);

      expect(mockBarberServiceService.addServiceToBarber).toHaveBeenCalled();
    });

    it("should reject BARBER adding service to another barber", async () => {
      const user = {
        loggedInAs: RoleName.BARBER,
        barberId: "barber1",
      } as any;

      await expect(
        controller.addService("barber-other", "service1", user),
      ).rejects.toThrow(ForbiddenException);
      expect(
        mockBarberServiceService.addServiceToBarber,
      ).not.toHaveBeenCalled();
    });
  });

  describe("removeService — assertBarberSelf", () => {
    it("should allow BARBER to remove their own service", async () => {
      const user = {
        loggedInAs: RoleName.BARBER,
        barberId: "barber1",
      } as any;
      mockBarberServiceService.removeServiceFromBarber.mockResolvedValue({
        message: "removed",
      });

      await controller.removeService("barber1", "service1", user);

      expect(
        mockBarberServiceService.removeServiceFromBarber,
      ).toHaveBeenCalledWith("barber1", "service1");
    });

    it("should reject BARBER removing another barber's service", async () => {
      const user = {
        loggedInAs: RoleName.BARBER,
        barberId: "barber1",
      } as any;

      await expect(
        controller.removeService("barber-other", "service1", user),
      ).rejects.toThrow(ForbiddenException);
      expect(
        mockBarberServiceService.removeServiceFromBarber,
      ).not.toHaveBeenCalled();
    });
  });
});
