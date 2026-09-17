import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { NextRequest, NextResponse } from "next/server";

function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "認証エラー";
  const status = message === "ログインしてください" ? 401 : 403;
  return NextResponse.json({ success: false, message }, { status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch (error) {
    return authErrorResponse(error);
  }

  const { id } = await params;
  const body = await request.json();

  // 「交換」操作:交換したら使用回数を0にリセットする
  if (body.replace === true) {
    const tool = await prisma.tool.update({
      where: { id: Number(id) },
      data: { useCount: 0 },
    });

    return NextResponse.json({ success: true, tool });
  }

  const tool = await prisma.tool.update({
    where: { id: Number(id) },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.stock !== undefined && { stock: Number(body.stock) }),
      ...(body.boxId !== undefined && { boxId: Number(body.boxId) }),
      ...(body.lifeLimit !== undefined && {
        lifeLimit: Number(body.lifeLimit),
      }),
    },
  });

  return NextResponse.json({ success: true, tool });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch (error) {
    return authErrorResponse(error);
  }

  const { id } = await params;

  const rentalCount = await prisma.rental.count({
    where: { toolId: Number(id) },
  });

  if (rentalCount > 0) {
    return NextResponse.json(
      { success: false, message: "貸出履歴が存在するため削除できません。" },
      { status: 409 },
    );
  }

  await prisma.tool.delete({ where: { id: Number(id) } });

  return NextResponse.json({ success: true });
}
