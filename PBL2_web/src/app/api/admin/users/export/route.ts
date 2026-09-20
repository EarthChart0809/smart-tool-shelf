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

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { employeeId: "asc" },
  });

  const csv = toCsv(
    users.map((user) => ({
      employeeId: user.employeeId,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    })),
    ["employeeId", "name", "createdAt"],
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users.csv"; filename*=UTF-8''${encodeURIComponent("社員一覧.csv")}`,
    },
  });
}
