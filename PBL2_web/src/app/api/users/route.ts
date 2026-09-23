import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { logAction } from "@/lib/audit";
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

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { employeeId: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  let admin;

  try {
    admin = await requireAdmin();
  } catch (error) {
    return authErrorResponse(error);
  }

  const body = await request.json();

  const user = await prisma.user.create({
    data: {
      employeeId: body.employeeId,
      name: body.name,
    },
  });

  await logAction({
    actorType: "ADMIN",
    actorId: admin.id,
    actorName: admin.name,
    action: "USER_CREATE",
    targetType: "User",
    targetId: String(user.id),
    detail: { employeeId: user.employeeId, name: user.name },
  });

  return NextResponse.json(user);
}