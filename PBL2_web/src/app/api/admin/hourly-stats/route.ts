import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { NextRequest, NextResponse } from "next/server";

function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "認証エラー";
  const status = message === "ログインしてください" ? 401 : 403;
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return authErrorResponse(error);
  }

  // ?days=30 のように指定すると直近N日に絞り込む。未指定なら全期間。
  const daysParam = request.nextUrl.searchParams.get("days");

  const where = daysParam
    ? {
        borrowedAt: {
          gte: new Date(Date.now() - Number(daysParam) * 24 * 60 * 60 * 1000),
        },
      }
    : {};

  const rentals = await prisma.rental.findMany({
    where,
    select: { borrowedAt: true },
  });

  // 0時〜23時の24区分で集計
  const hourlyCounts = new Array(24).fill(0);

  for (const rental of rentals) {
    const hour = new Date(rental.borrowedAt).getHours();
    hourlyCounts[hour]++;
  }

  const result = hourlyCounts.map((count, hour) => ({ hour, count }));

  return NextResponse.json({
    totalCount: rentals.length,
    hourly: result,
  });
}
