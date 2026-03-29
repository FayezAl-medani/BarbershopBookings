import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { AnalyticsFilterDto } from "./dto/request/analytics-filter.dto.js";
import {
  DashboardOverviewDto,
  WeeklyTrendItemDto,
  StatusDistributionDto,
  PopularServiceDto,
  BarberPerformanceDto,
  ProfitLossDto,
  BarbershopAnalyticsDto,
} from "./dto/response/analytics-response.dto.js";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  async getDashboardOverview(
    filter: AnalyticsFilterDto,
  ): Promise<DashboardOverviewDto> {
    const client = this.txContext.getClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const barbershopFilter = filter.barbershopId
      ? { barber: { barbershopId: filter.barbershopId } }
      : {};

    const dateFilter = this.buildDateFilter(filter);

    const [
      totalBookings,
      todaysBookings,
      totalBarbers,
      totalServices,
      totalCustomers,
      revenueAgg,
    ] = await Promise.all([
      client.booking.count({ where: { ...barbershopFilter, ...dateFilter } }),
      client.booking.count({
        where: {
          ...barbershopFilter,
          date: { gte: today, lt: tomorrow },
        },
      }),
      client.barber.count({
        where: {
          isActive: true,
          ...(filter.barbershopId && { barbershopId: filter.barbershopId }),
        },
      }),
      client.service.count({
        where: {
          isActive: true,
          ...(filter.barbershopId && { barbershopId: filter.barbershopId }),
        },
      }),
      client.customer.count(),
      client.booking.aggregate({
        where: {
          status: "COMPLETED",
          ...barbershopFilter,
          ...dateFilter,
        },
        _sum: { totalPrice: true },
        _count: true,
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.totalPrice || 0);
    const completedBookings = revenueAgg._count;

    return {
      totalBookings,
      todaysBookings,
      totalBarbers,
      totalServices,
      totalCustomers,
      totalRevenue,
      completedBookings,
      avgBookingValue:
        completedBookings > 0 ? totalRevenue / completedBookings : 0,
    };
  }

  async getWeeklyTrend(
    filter: AnalyticsFilterDto,
  ): Promise<WeeklyTrendItemDto[]> {
    const client = this.txContext.getClient();
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const barbershopFilter = filter.barbershopId
      ? { barber: { barbershopId: filter.barbershopId } }
      : {};

    // Single query with groupBy instead of 7 sequential count queries
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const results = await client.booking.groupBy({
      by: ["date"],
      _count: true,
      where: {
        date: { gte: weekStart, lt: tomorrow },
        ...barbershopFilter,
      },
    });

    const countMap = new Map(
      results.map((r) => [
        new Date(r.date).toISOString().split("T")[0],
        r._count,
      ]),
    );

    const days: WeeklyTrendItemDto[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toISOString().split("T")[0];

      days.push({
        date: dateStr,
        label: dayLabels[d.getDay()],
        count: countMap.get(dateStr) || 0,
      });
    }

    return days;
  }

  async getStatusDistribution(
    filter: AnalyticsFilterDto,
  ): Promise<StatusDistributionDto> {
    const client = this.txContext.getClient();
    const barbershopFilter = filter.barbershopId
      ? { barber: { barbershopId: filter.barbershopId } }
      : {};
    const dateFilter = this.buildDateFilter(filter);

    const results = await client.booking.groupBy({
      by: ["status"],
      _count: true,
      where: { ...barbershopFilter, ...dateFilter },
    });

    const distribution: StatusDistributionDto = {
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      NO_SHOW: 0,
    };

    for (const row of results) {
      if (row.status in distribution) {
        (distribution as any)[row.status] = row._count;
      }
    }

    return distribution;
  }

  async getPopularServices(
    filter: AnalyticsFilterDto,
  ): Promise<PopularServiceDto[]> {
    const client = this.txContext.getClient();
    const barbershopFilter = filter.barbershopId
      ? { barber: { barbershopId: filter.barbershopId } }
      : {};
    const dateFilter = this.buildDateFilter(filter);

    const results = await client.booking.groupBy({
      by: ["serviceId"],
      _count: true,
      where: { ...barbershopFilter, ...dateFilter },
      orderBy: { _count: { serviceId: "desc" } },
      take: 5,
    });

    const total = results.reduce((sum, r) => sum + r._count, 0) || 1;

    const services = await client.service.findMany({
      where: { id: { in: results.map((r) => r.serviceId) } },
      select: { id: true, name: true },
    });
    const serviceMap = new Map(services.map((s) => [s.id, s.name]));

    return results.map((r) => ({
      serviceId: r.serviceId,
      serviceName: serviceMap.get(r.serviceId) || "Unknown",
      bookingCount: r._count,
      percentage: Math.round((r._count / total) * 100),
    }));
  }

  async getBarberPerformance(
    filter: AnalyticsFilterDto,
  ): Promise<BarberPerformanceDto[]> {
    const client = this.txContext.getClient();
    const dateFilter = this.buildDateFilter(filter);

    const barbers = await client.barber.findMany({
      where: {
        isActive: true,
        ...(filter.barbershopId && { barbershopId: filter.barbershopId }),
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (barbers.length === 0) return [];

    const barberIds = barbers.map((b) => b.id);

    // Batch: 3 groupBy queries instead of 3*N individual aggregates
    const [bookingGroups, commissionGroups, reviewGroups] = await Promise.all([
      client.booking.groupBy({
        by: ["barberId"],
        _sum: { totalPrice: true },
        _count: true,
        where: {
          barberId: { in: barberIds },
          status: "COMPLETED",
          ...dateFilter,
        },
      }),
      client.commission.groupBy({
        by: ["barberId"],
        _sum: { amount: true },
        where: { barberId: { in: barberIds } },
      }),
      client.review.groupBy({
        by: ["barberId"],
        _avg: { rating: true },
        where: { barberId: { in: barberIds } },
      }),
    ]);

    const bookingMap = new Map(bookingGroups.map((r) => [r.barberId, r]));
    const commissionMap = new Map(commissionGroups.map((r) => [r.barberId, r]));
    const reviewMap = new Map(reviewGroups.map((r) => [r.barberId, r]));

    const results: BarberPerformanceDto[] = barbers.map((barber) => {
      const booking = bookingMap.get(barber.id);
      const commission = commissionMap.get(barber.id);
      const review = reviewMap.get(barber.id);
      const name =
        [barber.user?.firstName, barber.user?.lastName]
          .filter(Boolean)
          .join(" ") || "Unknown";

      return {
        barberId: barber.id,
        barberName: name,
        completedBookings: booking?._count || 0,
        totalRevenue: Number(booking?._sum.totalPrice || 0),
        totalCommission: Number(commission?._sum.amount || 0),
        avgRating: Number(review?._avg.rating || 0),
      };
    });

    return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  async getProfitLoss(filter: AnalyticsFilterDto): Promise<ProfitLossDto> {
    const client = this.txContext.getClient();
    const dateFilter = this.buildDateFilter(filter);
    const barbershopFilter = filter.barbershopId
      ? { barber: { barbershopId: filter.barbershopId } }
      : {};

    const now = new Date();
    const periodStart =
      filter.dateFrom ||
      new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
    const periodEnd = filter.dateTo || now.toISOString().split("T")[0];

    const salaryDateFilter = {
      ...(filter.dateFrom && {
        periodStart: { gte: new Date(filter.dateFrom) },
      }),
      ...(filter.dateTo && { periodEnd: { lte: new Date(filter.dateTo) } }),
    };

    const [revenueAgg, commissionAgg, salaryAgg] = await Promise.all([
      client.booking.aggregate({
        where: { status: "COMPLETED", ...barbershopFilter, ...dateFilter },
        _sum: { totalPrice: true },
      }),
      client.commission.aggregate({
        where: {
          ...(filter.barbershopId && {
            barber: { barbershopId: filter.barbershopId },
          }),
          ...((filter.dateFrom || filter.dateTo) && {
            createdAt: {
              ...(filter.dateFrom && { gte: new Date(filter.dateFrom) }),
              ...(filter.dateTo && { lte: new Date(filter.dateTo) }),
            },
          }),
        },
        _sum: { amount: true },
      }),
      client.salary.aggregate({
        where: {
          isPaid: true,
          ...(filter.barbershopId && {
            barber: { barbershopId: filter.barbershopId },
          }),
          ...salaryDateFilter,
        },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.totalPrice || 0);
    const totalCommissions = Number(commissionAgg._sum.amount || 0);
    const totalSalaries = Number(salaryAgg._sum.amount || 0);

    return {
      totalRevenue,
      totalCommissions,
      totalSalaries,
      netProfit: totalRevenue - totalCommissions - totalSalaries,
      periodStart,
      periodEnd,
    };
  }

  async getBarbershopAnalytics(): Promise<BarbershopAnalyticsDto[]> {
    const client = this.txContext.getClient();
    const barbershops = await client.barbershop.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { barbers: true } },
      },
    });

    if (barbershops.length === 0) return [];

    // Get all barbers grouped by barbershopId for mapping
    const allBarbers = await client.barber.findMany({
      where: { barbershopId: { in: barbershops.map((s) => s.id) } },
      select: { id: true, barbershopId: true },
    });

    const barberToShop = new Map(allBarbers.map((b) => [b.id, b.barbershopId]));
    const allBarberIds = allBarbers.map((b) => b.id);

    // Batch queries: groupBy barberId, then aggregate by shop
    const [bookingGroups, completedGroups, commissionGroups] =
      await Promise.all([
        client.booking.groupBy({
          by: ["barberId"],
          _count: true,
          _sum: { totalPrice: true },
          where: { barberId: { in: allBarberIds } },
        }),
        client.booking.groupBy({
          by: ["barberId"],
          _count: true,
          where: { barberId: { in: allBarberIds }, status: "COMPLETED" },
        }),
        client.commission.groupBy({
          by: ["barberId"],
          _sum: { amount: true },
          where: { barberId: { in: allBarberIds } },
        }),
      ]);

    // Aggregate per barbershop
    const shopStats = new Map<
      string,
      {
        totalBookings: number;
        completedBookings: number;
        totalRevenue: number;
        totalCommissions: number;
      }
    >();
    for (const shop of barbershops) {
      shopStats.set(shop.id, {
        totalBookings: 0,
        completedBookings: 0,
        totalRevenue: 0,
        totalCommissions: 0,
      });
    }

    for (const row of bookingGroups) {
      const shopId = barberToShop.get(row.barberId);
      if (shopId) {
        const stats = shopStats.get(shopId)!;
        stats.totalBookings += row._count;
        stats.totalRevenue += Number(row._sum.totalPrice || 0);
      }
    }
    for (const row of completedGroups) {
      const shopId = barberToShop.get(row.barberId);
      if (shopId) shopStats.get(shopId)!.completedBookings += row._count;
    }
    for (const row of commissionGroups) {
      const shopId = barberToShop.get(row.barberId);
      if (shopId)
        shopStats.get(shopId)!.totalCommissions += Number(row._sum.amount || 0);
    }

    const results: BarbershopAnalyticsDto[] = barbershops.map((shop) => {
      const stats = shopStats.get(shop.id)!;
      return {
        barbershopId: shop.id,
        barbershopName: shop.name,
        totalBookings: stats.totalBookings,
        completedBookings: stats.completedBookings,
        totalRevenue: stats.totalRevenue,
        totalCommissions: stats.totalCommissions,
        barberCount: shop._count.barbers,
        billingModel: shop.billingModel,
      };
    });

    return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  private buildDateFilter(filter: AnalyticsFilterDto): any {
    if (!filter.dateFrom && !filter.dateTo) return {};
    return {
      date: {
        ...(filter.dateFrom && { gte: new Date(filter.dateFrom) }),
        ...(filter.dateTo && { lte: new Date(filter.dateTo) }),
      },
    };
  }
}
