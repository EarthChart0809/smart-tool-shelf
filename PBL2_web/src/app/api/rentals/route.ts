import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { logAction } from "@/lib/audit";
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

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "社員が見つかりません。" },
      { status: 404 },
    );
  }

  const createdRentals: { toolId: number; toolName: string; quantity: number }[] = [];

  for (const tool of tools) {
    if (tool.quantity <= 0) continue;

    const rental = await prisma.rental.create({
      data: { userId, toolId: tool.id, quantity: tool.quantity },
      include: { tool: true },
    });

    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        stock: { decrement: tool.quantity },
        useCount: { increment: tool.quantity },
      },
    });

    createdRentals.push({
      toolId: tool.id,
      toolName: rental.tool.name,
      quantity: tool.quantity,
    });
  }

  await logAction({
    actorType: "EMPLOYEE",
    actorId: String(user.id),
    actorName: user.name,
    action: "RENTAL_CREATE",
    targetType: "Rental",
    detail: { tools: createdRentals },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { rentalId, userId } = body as { rentalId: number; userId?: number };

  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { tool: true, user: true },
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

  let actor: { type: "EMPLOYEE" | "ADMIN"; id: string; name: string };

  if (userId) {
    if (rental.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "自分の貸出のみ返却できます。" },
        { status: 403 },
      );
    }

    actor = { type: "EMPLOYEE", id: String(rental.user.id), name: rental.user.name };
  } else {
    try {
      const admin = await requireAdmin();
      actor = { type: "ADMIN", id: admin.id, name: admin.name };
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

  await logAction({
    actorType: actor.type,
    actorId: actor.id,
    actorName: actor.name,
    action: "RENTAL_RETURN",
    targetType: "Rental",
    targetId: String(rentalId),
    detail: {
      toolName: rental.tool.name,
      borrower: rental.user.name,
      quantity: rental.quantity,
    },
  });

  return NextResponse.json({ success: true });
}