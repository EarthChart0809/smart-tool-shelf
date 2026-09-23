import { prisma } from "@/lib/prisma";
import { getCurrentUserProfile } from "@/lib/current-profile";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json(
      { success: false, message: "ログインしてください。" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    createdAt: profile.createdAt,
  });
}

export async function PATCH(request: NextRequest) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json(
      { success: false, message: "ログインしてください。" },
      { status: 401 },
    );
  }

  const { name } = await request.json();

  if (!name) {
    return NextResponse.json(
      { success: false, message: "氏名を入力してください。" },
      { status: 400 },
    );
  }

  const updated = await prisma.userProfile.update({
    where: { id: profile.id },
    data: { name },
  });

  return NextResponse.json({ success: true, name: updated.name });
}