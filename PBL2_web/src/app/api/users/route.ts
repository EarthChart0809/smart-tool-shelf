import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: {
      employeeId: "asc",
    },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const user = await prisma.user.create({
    data: {
      employeeId: body.employeeId,
      name: body.name,
    },
  });

  return NextResponse.json(user);
}
