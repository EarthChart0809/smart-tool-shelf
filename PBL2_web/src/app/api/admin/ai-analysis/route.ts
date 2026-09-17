import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { generateAnalysis } from "@/lib/gemini";
import { NextResponse } from "next/server";

function authErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "認証エラー";
  const status = message === "ログインしてください" ? 401 : 403;
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST() {
  try {
    await requireAdmin();
  } catch (error) {
    return authErrorResponse(error);
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [thisWeekRentals, lastWeekRentals, tools, unreturnedRentals] =
    await Promise.all([
      prisma.rental.findMany({
        where: { borrowedAt: { gte: oneWeekAgo } },
        include: { tool: true },
      }),
      prisma.rental.findMany({
        where: { borrowedAt: { gte: twoWeeksAgo, lt: oneWeekAgo } },
        include: { tool: true },
      }),
      prisma.tool.findMany(),
      prisma.rental.findMany({
        where: { returnedAt: null },
        include: { tool: true, user: true },
      }),
    ]);

  // 工具ごとの貸出件数を集計(今週・先週)
  const countByTool = (rentals: typeof thisWeekRentals) => {
    const map = new Map<string, number>();
    for (const rental of rentals) {
      map.set(
        rental.tool.name,
        (map.get(rental.tool.name) ?? 0) + rental.quantity,
      );
    }
    return map;
  };

  const thisWeekCounts = countByTool(thisWeekRentals);
  const lastWeekCounts = countByTool(lastWeekRentals);

  const toolNames = new Set([
    ...thisWeekCounts.keys(),
    ...lastWeekCounts.keys(),
  ]);

  const weeklyComparison = Array.from(toolNames).map((name) => ({
    name,
    thisWeek: thisWeekCounts.get(name) ?? 0,
    lastWeek: lastWeekCounts.get(name) ?? 0,
  }));

  const lowStockTools = tools
    .filter((tool) => tool.stock <= 2)
    .map((tool) => ({ name: tool.name, stock: tool.stock }));

  const nearLifeLimitTools = tools
    .filter((tool) => tool.useCount / tool.lifeLimit >= 0.7)
    .map((tool) => ({
      name: tool.name,
      useCount: tool.useCount,
      lifeLimit: tool.lifeLimit,
    }));

  const overdueRentals = unreturnedRentals
    .filter(
      (rental) =>
        now.getTime() - new Date(rental.borrowedAt).getTime() >
        3 * 24 * 60 * 60 * 1000, // 3日以上未返却
    )
    .map((rental) => ({
      tool: rental.tool.name,
      user: rental.user.name,
      borrowedAt: rental.borrowedAt,
    }));

  const prompt = `
あなたは工場の工具管理システムのデータアナリストです。
以下のJSONデータをもとに、現場責任者向けに簡潔な日本語のレポートを作成してください。

# 出力ルール
- 3〜5個の箇条書きで、重要な傾向・注意点・推奨アクションをまとめる
- 数値の増減があれば「先週比◯%増加」のように具体的に述べる
- 在庫不足・工具寿命・返却遅延について、該当があれば必ず触れる
- 前置きや挨拶文は不要。箇条書きのみを出力する

# データ
## 工具ごとの週間貸出件数比較(今週 vs 先週)
${JSON.stringify(weeklyComparison, null, 2)}

## 在庫不足の工具(在庫2個以下)
${JSON.stringify(lowStockTools, null, 2)}

## 交換時期が近い工具(使用回数が寿命の70%以上)
${JSON.stringify(nearLifeLimitTools, null, 2)}

## 3日以上返却されていない貸出
${JSON.stringify(overdueRentals, null, 2)}
`;

  try {
    const analysisText = await generateAnalysis(prompt);
    return NextResponse.json({ success: true, analysis: analysisText });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "AI分析に失敗しました。",
      },
      { status: 500 },
    );
  }
}
