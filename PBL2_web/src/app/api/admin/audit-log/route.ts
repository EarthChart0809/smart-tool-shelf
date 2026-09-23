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

  const params = request.nextUrl.searchParams;
  const actorId = params.get("actorId");
  const action = params.get("action");

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(actorId && { actorId }),
      ...(action && { action }),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(logs);
}