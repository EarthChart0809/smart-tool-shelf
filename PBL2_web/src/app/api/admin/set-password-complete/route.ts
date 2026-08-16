import { getCurrentUserProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json(
      { success: false, message: "ログインしてください。" },
      { status: 401 },
    );
  }

  await prisma.userProfile.update({
    where: { id: profile.id },
    data: { passwordSet: true },
  });

  return NextResponse.json({ success: true });
}
