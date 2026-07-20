import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { NextRequest, NextResponse } from "next/server";

// 貸出履歴の一覧を取得
// ?userId=1 を付けると、その社員の「返却済みでない」貸出だけに絞り込む
// (QRログイン後の画面で「自分が借りているもの」を表示するために使う)
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  const rentals = await prisma.rental.findMany({
    where: userId
      ? {
          userId: Number(userId),
          returnedAt: null,
        }
      : undefined,
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
      where: { id: tool.id },
      data: { stock: { decrement: tool.quantity } },
    });
  }

  return NextResponse.json({ success: true });
}

// 返却処理
// - body.userId がある場合: QRログイン中の本人による返却。自分の貸出でなければ拒否
// - body.userId が無い場合: 管理者による代理返却とみなし、Supabase Authでの管理者ログインを必須にする
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { rentalId, userId } = body as { rentalId: number; userId?: number };

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

  if (userId) {
    // 本人による返却:貸出記録のuserIdと一致するか確認
    if (rental.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "自分の貸出のみ返却できます。" },
        { status: 403 },
      );
    }
  } else {
    // userIdが無い＝管理画面からの代理返却。管理者ログインを必須にする
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
