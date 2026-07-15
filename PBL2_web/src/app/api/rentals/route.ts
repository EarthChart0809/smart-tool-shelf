import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// 貸出履歴の一覧を取得 (以前は存在せず、履歴を確認する手段がなかった)
export async function GET() {
  const rentals = await prisma.rental.findMany({
    orderBy: {
      borrowedAt: "desc",
    },
    include: {
      user: true,
      tool: true,
    },
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
      where: {
        id: tool.id,
      },
      data: {
        stock: {
          decrement: tool.quantity,
        },
      },
    });
  }

  return NextResponse.json({
    success: true,
  });
}

// 返却処理：貸出履歴に返却日時を記録し、在庫を戻す
// (以前は在庫を減らすだけで、返却して在庫を戻す仕組みが一切なかった)
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { rentalId } = body as { rentalId: number };

  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
  });

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

  await prisma.rental.update({
    where: { id: rentalId },
    data: { returnedAt: new Date() },
  });

  await prisma.tool.update({
    where: { id: rental.toolId },
    data: {
      stock: {
        increment: rental.quantity,
      },
    },
  });

  return NextResponse.json({ success: true });
}
