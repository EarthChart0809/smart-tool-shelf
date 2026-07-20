import { NextRequest, NextResponse } from "next/server";

interface RequestedTool {
  id: number;
  quantity: number;
}

export async function POST(request: NextRequest) {
  const body: RequestedTool[] = await request.json();

  const boxes = body.filter((tool) => tool.quantity > 0).map((tool) => tool.id);

  const esp32 = await fetch("http://172.20.10.4/unlock", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      boxes,
    }),
  });

  const result = await esp32.text();

  return NextResponse.json({
    success: true,
    esp32: result,
  });
}
