import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const user = await prisma.user.findUnique({
    where: {
      employeeId: body.employeeId,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "社員が存在しません。",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    user,
  });
}
