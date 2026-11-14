import { prisma } from "@/lib/prisma";
import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function isValidDeviceKey(provided: string | null) {
  const expected = process.env.DEVICE_API_KEY;

  // キーが未設定のときは全て拒否する(設定漏れで無認証にならないように)
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!isValidDeviceKey(request.headers.get("x-device-key"))) {
    return NextResponse.json(
      { success: false, message: "認証に失敗しました。" },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const drawers = body?.drawers as Record<string, unknown> | undefined;

  if (!drawers || typeof drawers !== "object") {
    return NextResponse.json(
      { success: false, message: "drawers が必要です。" },
      { status: 400 },
    );
  }

  const entries = Object.entries(drawers)
    .map(([key, value]) => ({ boxId: Number(key), isOpen: value === true }))
    .filter((entry) => Number.isInteger(entry.boxId) && entry.boxId > 0)
    .slice(0, 50);

  if (entries.length === 0) {
    return NextResponse.json(
      { success: false, message: "有効な引き出し番号がありません。" },
      { status: 400 },
    );
  }

  const now = new Date();

  await prisma.$transaction(
    entries.map((entry) =>
      prisma.drawerState.upsert({
        where: { boxId: entry.boxId },
        create: { boxId: entry.boxId, isOpen: entry.isOpen, lastSeenAt: now },
        update: { isOpen: entry.isOpen, lastSeenAt: now },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}