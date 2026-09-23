import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { parseCsvToObjects } from "@/lib/csv";
import { NextRequest, NextResponse } from "next/server";
import { logAction } from "@/lib/audit";

function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "認証エラー";
  const status = message === "ログインしてください" ? 401 : 403;
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: NextRequest) {
  let admin;

  try {
    admin = await requireAdmin();
  } catch (error) {
    return authErrorResponse(error);
  }

  const { csv } = await request.json();

  if (!csv) {
    return NextResponse.json(
      { success: false, message: "CSVが空です。" },
      { status: 400 },
    );
  }

  const rows = parseCsvToObjects(csv);

  if (rows.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "データ行がありません。1行目はヘッダー行にしてください。",
      },
      { status: 400 },
    );
  }

  const created: string[] = [];
  const errors: string[] = [];

  for (const [index, row] of rows.entries()) {
    const lineNumber = index + 2;

    const name = row["name"] ?? row["工具名"];
    const stockRaw = row["stock"] ?? row["在庫数"];
    const boxIdRaw = row["boxId"] ?? row["ボックスID"];
    const lifeLimitRaw = row["lifeLimit"] ?? row["交換推奨回数"];

    if (!name || !stockRaw || !boxIdRaw) {
      errors.push(`${lineNumber}行目: 工具名・在庫数・ボックスIDは必須です。`);
      continue;
    }

    const stock = Number(stockRaw);
    const boxId = Number(boxIdRaw);
    const lifeLimit = lifeLimitRaw ? Number(lifeLimitRaw) : 200;

    if (Number.isNaN(stock) || Number.isNaN(boxId) || Number.isNaN(lifeLimit)) {
      errors.push(`${lineNumber}行目: 数値として読み取れない項目があります。`);
      continue;
    }

    await prisma.tool.create({
      data: { name, stock, boxId, lifeLimit },
    });

    created.push(name);
  }

  await logAction({
    actorType: "ADMIN",
    actorId: admin.id,
    actorName: admin.name,
    action: "TOOL_BULK_IMPORT",
    targetType: "Tool",
    detail: { createdCount: created.length, errorCount: errors.length },
  });

  return NextResponse.json({
    success: true,
    createdCount: created.length,
    errors,
  });
}
