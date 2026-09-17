import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { NextRequest, NextResponse } from "next/server";

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

  const tools = await prisma.tool.findMany({ orderBy: { boxId: "asc" } });
  return NextResponse.json(tools);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return authErrorResponse(error);
  }

  const body = await request.json();

  if (!body.name || body.stock === undefined || body.boxId === undefined) {
    return NextResponse.json(
      { success: false, message: "工具名・在庫数・ボックスIDは必須です。" },
      { status: 400 },
    );
  }

  const tool = await prisma.tool.create({
    data: {
      name: body.name,
      stock: Number(body.stock),
      boxId: Number(body.boxId),
      // 交換推奨回数(未指定なら200回をデフォルトとする)
      lifeLimit: body.lifeLimit ? Number(body.lifeLimit) : 200,
    },
  });

  return NextResponse.json({ success: true, tool });
}
