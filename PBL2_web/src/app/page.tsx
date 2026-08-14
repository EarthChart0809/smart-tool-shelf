"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ToolCard from "@/app/_components/ToolCard";
import { Tool } from "@/app/types/tool";
import { useAuth } from "@/app/providers/AuthProvider";
import { unlockBoxesViaLan } from "@/lib/esp32-client";

interface MyRental {
  id: number;
  quantity: number;
  borrowedAt: string;
  tool: { id: number; name: string; boxId: number };
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [tools, setTools] = useState<(Tool & { quantity: number })[]>([]);
  const [myRentals, setMyRentals] = useState<MyRental[]>([]);
  const [unlockMessage, setUnlockMessage] = useState("");

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    if (user) {
      loadMyRentals();
    }
  }, [user]);

  const loadTools = async () => {
    const response = await fetch("/api/tools");
    const data: Tool[] = await response.json();

    setTools(data.map((tool) => ({ ...tool, quantity: 0 })));
  };

  const loadMyRentals = async () => {
    if (!user) return;

    const response = await fetch(`/api/rentals?userId=${user.id}`);
    const data = await response.json();
    setMyRentals(data);
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

    const rentalResponse = await fetch("/api/rentals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user!.id, tools: requested }),
    });

    const rentalData = await rentalResponse.json();

    if (!rentalData.success) {
      alert("貸出処理に失敗しました。");
      return;
    }

    const boxRequests = requested.map((tool) => ({
      id: tool.boxId,
      quantity: tool.quantity,
    }));

    await unlockBoxes(boxRequests);
    await loadTools();
    await loadMyRentals();

    try {
      const unlockResponse = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(boxRequests),
      });

      const unlockData = await unlockResponse.json();

      if (unlockData.success) {
        setUnlockMessage(
          "扉が開いています。工具を取り出してください(自動施錠されます)",
        );
        setTimeout(() => setUnlockMessage(""), 8000);
      } else {
        alert("解錠に失敗しました。ボックスの状態を確認してください。");
      }
    } catch (error) {
      console.error(error);
      alert("ESP32との通信に失敗しました。");
    }

    await loadTools();
  };

  const unlockBoxes = async (boxes: { id: number; quantity: number }[]) => {
    const result = await unlockBoxesViaLan(boxes);

    if (result.success) {
      setUnlockMessage(
        "扉が開いています。工具を取り出し/戻して閉じてください(自動施錠されます)",
      );
      setTimeout(() => setUnlockMessage(""), 8000);
    } else {
      alert(result.message ?? "解錠に失敗しました。");
    }
  };

  const handleReturn = async (rental: MyRental, boxId: number) => {
    const response = await fetch("/api/rentals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rentalId: rental.id, userId: user!.id }),
    });

    const data = await response.json();

    if (!data.success) {
      alert(data.message ?? "返却に失敗しました。");
      return;
    }

    const boxRequests = [{ id: rental.tool.boxId, quantity: 1 }];
    await unlockBoxes(boxRequests);
    await loadTools();
    await loadMyRentals();
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-100">
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
      <div className="mx-auto max-w-3xl p-6">
        {unlockMessage && (
          <p className="mb-4 rounded bg-blue-100 p-3 text-center text-blue-800">
            {unlockMessage}
          </p>
        )}

        {myRentals.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold">あなたが借りている工具</h2>

            <div className="space-y-3">
              {myRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="flex items-center justify-between rounded-lg border bg-white p-4 shadow"
                >
                  <div>
                    <p className="font-bold">{rental.tool.name}</p>
                    <p className="text-sm text-gray-500">
                      数量: {rental.quantity} / 貸出:
                      {new Date(rental.borrowedAt).toLocaleString("ja-JP")}
                    </p>
                  </div>

                  <button
                    onClick={() => handleReturn(rental, rental.tool.boxId)}
                    className="rounded bg-blue-600 px-4 py-2 text-white"
                  >
                    返却する
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-xl font-bold">工具を借りる</h2>

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
        </section>
      </div>
    </main>
  );
}
