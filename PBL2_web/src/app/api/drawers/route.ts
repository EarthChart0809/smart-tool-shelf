import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ESP32は10秒ごとに報告するので、30秒以上途絶えたら未接続とみなす
const ONLINE_THRESHOLD_MS = 30_000;

export async function GET() {
  const rows = await prisma.drawerState.findMany({
    orderBy: { boxId: "asc" },
  });

  const latest = rows.reduce(
    (max, row) => Math.max(max, row.lastSeenAt.getTime()),
    0,
  );

  return NextResponse.json({
    drawers: rows.map((row) => ({ boxId: row.boxId, isOpen: row.isOpen })),
    online: latest > 0 && Date.now() - latest < ONLINE_THRESHOLD_MS,
  });
}