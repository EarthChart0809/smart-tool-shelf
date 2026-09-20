import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { parseCsvToObjects } from "@/lib/csv";
import { NextRequest, NextResponse } from "next/server";

function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "認証エラー";
  const status = message === "ログインしてください" ? 401 : 403;
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
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

  // 何行目でエラーが起きたか利用者に伝えられるよう、1件ずつ処理する
  for (const [index, row] of rows.entries()) {
    const lineNumber = index + 2; // ヘッダー行の分

    const employeeId = row["employeeId"] ?? row["社員番号"];
    const name = row["name"] ?? row["氏名"];

    if (!employeeId || !name) {
      errors.push(`${lineNumber}行目: 社員番号と氏名は必須です。`);
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { employeeId } });

    if (existing) {
      errors.push(
        `${lineNumber}行目: 社員番号「${employeeId}」は登録済みです。`,
      );
      continue;
    }

    await prisma.user.create({
      data: { employeeId, name },
    });

    created.push(employeeId);
  }

  return NextResponse.json({
    success: true,
    createdCount: created.length,
    errors,
  });
}
