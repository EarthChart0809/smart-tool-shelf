"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/_components/Header";
import ToolCard from "@/app/_components/ToolCard";
import { Tool } from "@/app/types/tool";
import { useAuth } from "@/app/providers/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [tools, setTools] = useState<(Tool & { quantity: number })[]>([]);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    // 以前は存在しない "/api/rentals" (GET) を呼んでおり、常に取得失敗していた
    const response = await fetch("/api/tools");
    const data: Tool[] = await response.json();

    const toolsWithQuantity = data.map((tool) => ({
      ...tool,
      quantity: 0,
    }));

    setTools(toolsWithQuantity);
  };

  const increase = (id: number) => {
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === id ? { ...tool, quantity: tool.quantity + 1 } : tool,
      ),
    );
  };

  const decrease = (id: number) => {
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === id && tool.quantity > 0
          ? { ...tool, quantity: tool.quantity - 1 }
          : tool,
      ),
    );
  };

  const handleUnlock = async () => {
    const requested = tools.filter((tool) => tool.quantity > 0);

    if (requested.length === 0) {
      alert("数量を選択してください。");
      return;
    }

    // 1. 貸出履歴を作成し、在庫を減らす
    const rentalResponse = await fetch("/api/rentals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user!.id,
        tools: requested,
      }),
    });

    const rentalData = await rentalResponse.json();

    if (!rentalData.success) {
      alert("貸出処理に失敗しました。");
      return;
    }

    // 2. ESP32へ解錠指示を送る (以前はここが呼ばれておらず実際には解錠されなかった)
    try {
      const unlockResponse = await fetch("/api/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requested),
      });

      const unlockData = await unlockResponse.json();

      if (!unlockData.success) {
        alert("解錠に失敗しました。ボックスの状態を確認してください。");
      }
    } catch (error) {
      console.error(error);
      alert("ESP32との通信に失敗しました。");
    }

    await loadTools();
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-100">
        <Header />

        <div className="mx-auto max-w-xl p-10 text-center">
          <p className="mb-6 text-lg">工具を借りるにはログインが必要です。</p>

          <button
            onClick={() => router.push("/qr")}
            className="rounded bg-blue-600 px-6 py-3 font-bold text-white"
          >
            QRコードでログイン
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <div className="mx-auto max-w-3xl p-6">
        <div className="space-y-4">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onIncrease={() => increase(tool.id)}
              onDecrease={() => decrease(tool.id)}
              disabled={!user}
            />
          ))}
        </div>

        <button
          onClick={handleUnlock}
          className="mt-6 w-full rounded bg-blue-500 py-3 font-bold text-white hover:bg-blue-700"
        >
          開錠する
        </button>
      </div>
    </main>
  );
}
