import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { NextResponse } from "next/server";

// 在庫がこの数以下になったら「在庫不足」とみなす(仮の閾値。運用に合わせて調整)
const LOW_STOCK_THRESHOLD = 2;

function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "認証エラー";
  const status = message === "ログインしてください" ? 401 : 403;
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    return authErrorResponse(error);
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    todayBorrowedCount,
    todayReturnedCount,
    currentlyBorrowedCount,
    lowStockTools,
    employeeCount,
    toolCount,
    recentBorrows,
    recentReturns,
  ] = await Promise.all([
    prisma.rental.count({
      where: { borrowedAt: { gte: todayStart } },
    }),

    prisma.rental.count({
      where: { returnedAt: { gte: todayStart } },
    }),

    prisma.rental
      .aggregate({
        where: { returnedAt: null },
        _sum: { quantity: true },
      })
      .then((result) => result._sum.quantity ?? 0),

    prisma.tool.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
    }),

    prisma.user.count({ where: { role: "USER" } }),
    prisma.tool.count(),

    prisma.rental.findMany({
      orderBy: { borrowedAt: "desc" },
      take: 5,
      include: { user: true, tool: true },
    }),

    prisma.rental.findMany({
      where: { returnedAt: { not: null } },
      orderBy: { returnedAt: "desc" },
      take: 5,
      include: { user: true, tool: true },
    }),
  ]);

  const allTools = await prisma.tool.findMany();
  const criticalTools = allTools.filter(
    (tool) => tool.lifeLimit > 0 && tool.useCount / tool.lifeLimit >= 0.9,
  );

  return NextResponse.json({
    todayBorrowedCount,
    todayReturnedCount,
    currentlyBorrowedCount,
    lowStockTools,
    criticalTools,
    employeeCount,
    toolCount,
    recentBorrows,
    recentReturns,
  });
}
