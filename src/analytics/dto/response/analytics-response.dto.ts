import { ApiProperty } from "@nestjs/swagger";

export class DashboardOverviewDto {
  @ApiProperty()
  totalBookings: number;

  @ApiProperty()
  todaysBookings: number;

  @ApiProperty()
  totalBarbers: number;

  @ApiProperty()
  totalServices: number;

  @ApiProperty()
  totalCustomers: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  completedBookings: number;

  @ApiProperty()
  avgBookingValue: number;
}

export class WeeklyTrendItemDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  count: number;
}

export class StatusDistributionDto {
  @ApiProperty()
  PENDING: number;

  @ApiProperty()
  CONFIRMED: number;

  @ApiProperty()
  COMPLETED: number;

  @ApiProperty()
  CANCELLED: number;

  @ApiProperty()
  NO_SHOW: number;
}

export class PopularServiceDto {
  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  bookingCount: number;

  @ApiProperty()
  percentage: number;
}

export class BarberPerformanceDto {
  @ApiProperty()
  barberId: string;

  @ApiProperty()
  barberName: string;

  @ApiProperty()
  completedBookings: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalCommission: number;

  @ApiProperty()
  avgRating: number;
}

export class ProfitLossDto {
  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalCommissions: number;

  @ApiProperty()
  totalSalaries: number;

  @ApiProperty()
  netProfit: number;

  @ApiProperty()
  periodStart: string;

  @ApiProperty()
  periodEnd: string;
}

export class BarbershopAnalyticsDto {
  @ApiProperty()
  barbershopId: string;

  @ApiProperty()
  barbershopName: string;

  @ApiProperty()
  totalBookings: number;

  @ApiProperty()
  completedBookings: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalCommissions: number;

  @ApiProperty()
  barberCount: number;

  @ApiProperty()
  billingModel: string;
}
