import { BookingService } from "./booking.service";
import { BookingStatus } from "./enums/booking-status.enum";

// ── Mocks ──
const mockBookingRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAllPaging: jest.fn(),
  updateById: jest.fn(),
  findOverlappingBookings: jest.fn(),
  findBarberBookingsForDate: jest.fn(),
};

const mockBookingMapper = {
  modelToEntity: jest.fn((m) => m),
  entityToResponseDto: jest.fn((e) => e),
};

const mockI18nService = {
  translate: jest.fn((key) => key),
};

const mockBarberServiceService = {
  barberOffersService: jest.fn(),
};

const mockServiceService = {
  getById: jest.fn(),
};

const mockScheduleService = {
  findAll: jest.fn(),
};

const mockCommissionService = {
  createFromBooking: jest.fn(),
};

describe("BookingService", () => {
  let service: BookingService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new BookingService(
      mockBookingRepository as any,
      mockBookingMapper as any,
      mockI18nService as any,
      mockBarberServiceService as any,
      mockServiceService as any,
      mockScheduleService as any,
      mockCommissionService as any,
    );
  });

  // ── addMinutesToTime tests ──
  describe("addMinutesToTime (via getAvailability)", () => {
    it("should correctly add minutes to time", async () => {
      // Access private method through availability calculation
      mockServiceService.getById.mockResolvedValue({ duration: 30, price: 50 });
      mockScheduleService.findAll.mockResolvedValue([
        { startTime: "09:00", endTime: "12:00" },
      ]);
      mockBookingRepository.findBarberBookingsForDate.mockResolvedValue([]);

      const result = await service.getAvailability(
        "barber1",
        "2026-04-01",
        "service1",
      );

      expect(result.availableSlots).toHaveLength(6); // 09:00-09:30, 09:30-10:00, ..., 11:30-12:00
      expect(result.availableSlots[0]).toEqual({
        startTime: "09:00",
        endTime: "09:30",
      });
      expect(result.availableSlots[5]).toEqual({
        startTime: "11:30",
        endTime: "12:00",
      });
    });

    it("should handle time crossing hour boundary", async () => {
      mockServiceService.getById.mockResolvedValue({ duration: 45, price: 70 });
      mockScheduleService.findAll.mockResolvedValue([
        { startTime: "09:00", endTime: "11:00" },
      ]);
      mockBookingRepository.findBarberBookingsForDate.mockResolvedValue([]);

      const result = await service.getAvailability(
        "barber1",
        "2026-04-01",
        "service1",
      );

      // 09:00-09:45, 09:45-10:30 (10:30-11:15 goes past end)
      expect(result.availableSlots).toHaveLength(2);
      expect(result.availableSlots[0]).toEqual({
        startTime: "09:00",
        endTime: "09:45",
      });
      expect(result.availableSlots[1]).toEqual({
        startTime: "09:45",
        endTime: "10:30",
      });
    });
  });

  // ── Availability with existing bookings ──
  describe("getAvailability", () => {
    it("should return empty slots when barber has no schedule for the day", async () => {
      mockServiceService.getById.mockResolvedValue({ duration: 30, price: 50 });
      mockScheduleService.findAll.mockResolvedValue([]);

      const result = await service.getAvailability(
        "barber1",
        "2026-04-01",
        "service1",
      );

      expect(result.availableSlots).toHaveLength(0);
    });

    it("should exclude slots that overlap with existing bookings", async () => {
      mockServiceService.getById.mockResolvedValue({ duration: 30, price: 50 });
      mockScheduleService.findAll.mockResolvedValue([
        { startTime: "09:00", endTime: "11:00" },
      ]);
      mockBookingRepository.findBarberBookingsForDate.mockResolvedValue([
        { startTime: "09:30", endTime: "10:00" }, // blocks 09:30-10:00
        { startTime: "10:00", endTime: "10:30" }, // blocks 10:00-10:30
      ]);

      const result = await service.getAvailability(
        "barber1",
        "2026-04-01",
        "service1",
      );

      // Available: 09:00-09:30, 10:30-11:00
      expect(result.availableSlots).toHaveLength(2);
      expect(result.availableSlots[0]).toEqual({
        startTime: "09:00",
        endTime: "09:30",
      });
      expect(result.availableSlots[1]).toEqual({
        startTime: "10:30",
        endTime: "11:00",
      });
    });

    it("should return no slots when all slots are booked", async () => {
      mockServiceService.getById.mockResolvedValue({
        duration: 60,
        price: 100,
      });
      mockScheduleService.findAll.mockResolvedValue([
        { startTime: "09:00", endTime: "11:00" },
      ]);
      mockBookingRepository.findBarberBookingsForDate.mockResolvedValue([
        { startTime: "09:00", endTime: "10:00" },
        { startTime: "10:00", endTime: "11:00" },
      ]);

      const result = await service.getAvailability(
        "barber1",
        "2026-04-01",
        "service1",
      );

      expect(result.availableSlots).toHaveLength(0);
    });
  });

  // ── Booking creation ──
  describe("create", () => {
    const basePayload = {
      customerId: "customer1",
      barberId: "barber1",
      serviceId: "service1",
      date: "2026-04-01",
      startTime: "10:00",
      notes: "test",
    };

    beforeEach(() => {
      mockBarberServiceService.barberOffersService.mockResolvedValue(true);
      mockServiceService.getById.mockResolvedValue({ duration: 30, price: 50 });
      mockScheduleService.findAll.mockResolvedValue([
        { startTime: "09:00", endTime: "17:00" },
      ]);
      mockBookingRepository.findOverlappingBookings.mockResolvedValue([]);
      mockBookingRepository.create.mockImplementation((data) => ({
        id: "booking1",
        ...data,
      }));
    });

    it("should create a booking with correct endTime and price snapshot", async () => {
      await service.create(basePayload);

      expect(mockBookingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: "10:00",
          endTime: "10:30",
          totalPrice: 50,
          status: BookingStatus.CONFIRMED,
          paymentStatus: "UNPAID",
          paymentMethod: "CASH",
        }),
      );
    });

    it("should reject booking when barber does not offer the service", async () => {
      mockBarberServiceService.barberOffersService.mockResolvedValue(false);

      await expect(service.create(basePayload)).rejects.toThrow();
      expect(mockBookingRepository.create).not.toHaveBeenCalled();
    });

    it("should reject booking outside working hours", async () => {
      mockScheduleService.findAll.mockResolvedValue([]);

      await expect(service.create(basePayload)).rejects.toThrow();
    });

    it("should reject booking when start is before schedule", async () => {
      mockScheduleService.findAll.mockResolvedValue([
        { startTime: "11:00", endTime: "17:00" },
      ]);

      await expect(service.create(basePayload)).rejects.toThrow();
    });

    it("should reject booking when end exceeds schedule", async () => {
      const payload = { ...basePayload, startTime: "16:45" };
      mockServiceService.getById.mockResolvedValue({ duration: 30, price: 50 });
      mockScheduleService.findAll.mockResolvedValue([
        { startTime: "09:00", endTime: "17:00" },
      ]);

      // 16:45 + 30 min = 17:15 > 17:00, should reject
      await expect(service.create(payload)).rejects.toThrow();
    });

    it("should reject double booking (overlapping slots)", async () => {
      mockBookingRepository.findOverlappingBookings.mockResolvedValue([
        { id: "existing1", startTime: "10:00", endTime: "10:30" },
      ]);

      await expect(service.create(basePayload)).rejects.toThrow();
    });
  });

  // ── Booking cancellation ──
  describe("cancel", () => {
    it("should cancel a confirmed booking", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.CONFIRMED,
      });
      mockBookingRepository.updateById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.CANCELLED,
      });

      const result = await service.cancel("booking1");

      expect(result).toBeDefined();
      expect(mockBookingRepository.updateById).toHaveBeenCalledWith(
        "booking1",
        {
          status: BookingStatus.CANCELLED,
        },
      );
    });

    it("should reject cancelling an already cancelled booking", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.CANCELLED,
      });

      await expect(service.cancel("booking1")).rejects.toThrow();
    });

    it("should reject cancelling a completed booking", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.COMPLETED,
      });

      await expect(service.cancel("booking1")).rejects.toThrow();
    });

    it("should reject cancelling a no-show booking", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.NO_SHOW,
      });

      await expect(service.cancel("booking1")).rejects.toThrow();
      expect(mockBookingRepository.updateById).not.toHaveBeenCalled();
    });

    it("should cancel a pending booking", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.PENDING,
      });
      mockBookingRepository.updateById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.CANCELLED,
      });

      const result = await service.cancel("booking1");

      expect(result).toBeDefined();
      expect(mockBookingRepository.updateById).toHaveBeenCalledWith(
        "booking1",
        { status: BookingStatus.CANCELLED },
      );
    });
  });

  // ── Booking completion ──
  describe("complete", () => {
    it("should complete a booking and trigger commission", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.CONFIRMED,
      });
      mockBookingRepository.updateById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.COMPLETED,
      });

      await service.complete("booking1");

      expect(mockBookingRepository.updateById).toHaveBeenCalledWith(
        "booking1",
        {
          status: BookingStatus.COMPLETED,
        },
      );
      expect(mockCommissionService.createFromBooking).toHaveBeenCalledWith(
        "booking1",
      );
    });

    it("should complete booking even if commission creation fails", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.CONFIRMED,
      });
      mockBookingRepository.updateById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.COMPLETED,
      });
      mockCommissionService.createFromBooking.mockRejectedValue(
        new Error("No commission rate"),
      );

      // Should not throw
      const result = await service.complete("booking1");
      expect(result).toBeDefined();
    });

    it("should throw when booking not found", async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(service.complete("nonexistent")).rejects.toThrow();
    });

    it("should reject completing an already completed booking", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.COMPLETED,
      });

      await expect(service.complete("booking1")).rejects.toThrow(
        /Cannot complete a booking with status COMPLETED/,
      );
      expect(mockBookingRepository.updateById).not.toHaveBeenCalled();
    });

    it("should reject completing a cancelled booking", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.CANCELLED,
      });

      await expect(service.complete("booking1")).rejects.toThrow(
        /Cannot complete a booking with status CANCELLED/,
      );
      expect(mockBookingRepository.updateById).not.toHaveBeenCalled();
    });

    it("should reject completing a no-show booking", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.NO_SHOW,
      });

      await expect(service.complete("booking1")).rejects.toThrow(
        /Cannot complete a booking with status NO_SHOW/,
      );
      expect(mockBookingRepository.updateById).not.toHaveBeenCalled();
    });

    it("should allow completing a pending booking", async () => {
      mockBookingRepository.findById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.PENDING,
      });
      mockBookingRepository.updateById.mockResolvedValue({
        id: "booking1",
        status: BookingStatus.COMPLETED,
      });

      const result = await service.complete("booking1");

      expect(result).toBeDefined();
      expect(mockBookingRepository.updateById).toHaveBeenCalledWith(
        "booking1",
        { status: BookingStatus.COMPLETED },
      );
    });
  });

  // ── getDayOfWeek ──
  describe("getDayOfWeek", () => {
    it("should return correct day for various dates", async () => {
      // We test this through availability since getDayOfWeek is private
      mockServiceService.getById.mockResolvedValue({ duration: 30, price: 50 });
      mockScheduleService.findAll.mockResolvedValue([]);

      // 2026-04-01 is a Wednesday
      await service.getAvailability("barber1", "2026-04-01", "service1");

      expect(mockScheduleService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          dayOfWeek: "WEDNESDAY",
        }),
      );
    });
  });
});
