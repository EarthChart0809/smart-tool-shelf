import { getCurrentUserProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";

export async function GET() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json({ isAdmin: false });
  }

  return NextResponse.json({
    isAdmin: profile.role === "ADMIN",
    name: profile.name,
  });
}
