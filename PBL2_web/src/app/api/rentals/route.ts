import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  const rentals = await prisma.rental.findMany({
    where: userId ? { userId: Number(userId), returnedAt: null } : undefined,
    orderBy: { borrowedAt: "desc" },
    include: { user: true, tool: true },
  });

  return NextResponse.json(rentals);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.userId) {
    return NextResponse.json(
      { success: false, message: "ログインしてください。" },
      { status: 401 },
    );
  }

  const { userId, tools } = body as {
    userId: number;
    tools: { id: number; quantity: number }[];
  };

  for (const tool of tools) {
    if (tool.quantity <= 0) continue;

    await prisma.rental.create({
      data: {
        userId,
        toolId: tool.id,
        quantity: tool.quantity,
      },
    });

    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        stock: { decrement: tool.quantity },
        // 貸出のたびに使用回数を加算し、工具の寿命管理に使う
        useCount: { increment: tool.quantity },
      },
    });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { rentalId, userId } = body as { rentalId: number; userId?: number };

  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });

  if (!rental) {
    return NextResponse.json(
      { success: false, message: "貸出履歴が見つかりません。" },
      { status: 404 },
    );
  }

  if (rental.returnedAt) {
    return NextResponse.json(
      { success: false, message: "既に返却済みです。" },
      { status: 400 },
    );
  }

  if (userId) {
    if (rental.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "自分の貸出のみ返却できます。" },
        { status: 403 },
      );
    }
  } else {
    try {
      await requireAdmin();
    } catch (error) {
      const message = error instanceof Error ? error.message : "認証エラー";
      const status = message === "ログインしてください" ? 401 : 403;
      return NextResponse.json({ success: false, message }, { status });
    }
  }

  await prisma.rental.update({
    where: { id: rentalId },
    data: { returnedAt: new Date() },
  });

  await prisma.tool.update({
    where: { id: rental.toolId },
    data: { stock: { increment: rental.quantity } },
  });

  return NextResponse.json({ success: true });
}
