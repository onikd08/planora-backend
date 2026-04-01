import { prisma } from "../../lib/prisma";

const getUserDashboardStats = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    // HOST METRICS
    const hostedEventsCount = await tx.event.count({
      where: { creatorId: userId, isDeleted: false },
    });

    const totalRevenue = await tx.payment.aggregate({
      where: {
        participation: { event: { creatorId: userId } },
        paymentStatus: "PAID",
      },
      _sum: { amount: true },
    });

    const totalAttendees = await tx.eventParticipation.count({
      where: {
        event: { creatorId: userId },
        participationStatus: "CONFIRMED",
      },
    });

    // PARTICIPANT METRICS
    const joinedEventsCount = await tx.eventParticipation.count({
      where: { userId },
    });

    const totalSpent = await tx.payment.aggregate({
      where: {
        participation: { userId },
        paymentStatus: "PAID",
      },
      _sum: { amount: true },
    });

    return {
      host: {
        eventsHosted: hostedEventsCount,
        revenue: totalRevenue._sum.amount || 0,
        attendees: totalAttendees,
      },
      participant: {
        eventsJoined: joinedEventsCount,
        totalSpent: totalSpent._sum.amount || 0,
      },
    };
  });
};

const getAdminDashboardStats = async () => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return await prisma.$transaction(async (tx) => {
    // 1. ROLE BREAKDOWN
    const roleBreakdown = await tx.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    });

    // 2. REVENUE COMPARISON (This Month vs Last Month)
    const currentMonthRevenue = await tx.payment.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: startOfCurrentMonth },
      },
      _sum: { amount: true },
    });

    const lastMonthRevenue = await tx.payment.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfCurrentMonth,
        },
      },
      _sum: { amount: true },
    });

    // 3. TOTALS (Your existing logic)
    const totalActiveUsers = await tx.user.count({
      where: { status: "ACTIVE" },
    });
    const totalInactiveUsers = await tx.user.count({
      where: { status: "BANNED" },
    });
    const totalEvents = await tx.event.count({ where: { isDeleted: false } });
    const totalParticipations = await tx.eventParticipation.count();

    const totalRevenue = await tx.payment.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { amount: true },
    });

    // 4. CATEGORY BREAKDOWN
    const categoryBreakdown = await tx.eventCategory.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { events: { where: { isDeleted: false } } },
        },
      },
    });

    // Calculate Growth Percentage
    const currentRev = currentMonthRevenue._sum.amount || 0;
    const lastRev = lastMonthRevenue._sum.amount || 0;
    const revenueGrowth =
      lastRev === 0 ? 100 : ((currentRev - lastRev) / lastRev) * 100;

    return {
      users: {
        totalActive: totalActiveUsers,
        totalInactive: totalInactiveUsers,
        roles: roleBreakdown, // [{ role: 'ADMIN', _count: { _all: 5 } }, ...]
      },
      events: {
        total: totalEvents,
        participations: totalParticipations,
        categories: categoryBreakdown,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
        currentMonth: currentRev,
        lastMonth: lastRev,
        growthPercentage: parseFloat(revenueGrowth.toFixed(2)),
      },
    };
  });
};

export const DashboardService = {
  getUserDashboardStats,
  getAdminDashboardStats,
};
