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

  const rentals = await prisma.rental.findMany({
    orderBy: { borrowedAt: "desc" },
    include: { user: true, tool: true },
  });

  const csv = toCsv(
    rentals.map((rental) => ({
      toolName: rental.tool.name,
      employeeId: rental.user.employeeId,
      userName: rental.user.name,
      quantity: rental.quantity,
      borrowedAt: rental.borrowedAt.toISOString(),
      returnedAt: rental.returnedAt ? rental.returnedAt.toISOString() : "",
      status: rental.returnedAt ? "返却済み" : "貸出中",
    })),
    [
      "toolName",
      "employeeId",
      "userName",
      "quantity",
      "borrowedAt",
      "returnedAt",
      "status",
    ],
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="貸出履歴.csv"`,
    },
  });
}
