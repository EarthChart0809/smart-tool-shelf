import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { toCsv } from "@/lib/csv";
import { NextResponse } from "next/server";

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

  const csv = toCsv(
    tools.map((tool) => ({
      name: tool.name,
      stock: tool.stock,
      boxId: tool.boxId,
      lifeLimit: tool.lifeLimit,
      useCount: tool.useCount,
    })),
    ["name", "stock", "boxId", "lifeLimit", "useCount"],
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tools.csv"; filename*=UTF-8''${encodeURIComponent("工具一覧.csv")}`,
    },
  });
}
