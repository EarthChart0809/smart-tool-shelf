"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ToolCard from "@/app/_components/ToolCard";
import { Tool } from "@/app/types/tool";
import { useAuth } from "@/app/providers/AuthProvider";

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
    try {
      const unlockResponse = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(boxes),
      });

      const unlockData = await unlockResponse.json();

      if (unlockData.success) {
        setUnlockMessage(
          "扉が開いています。工具を取り出し/戻して閉じてください(自動施錠されます)",
        );
        setTimeout(() => setUnlockMessage(""), 8000);
      } else {
        alert("解錠に失敗しました。ボックスの状態を確認してください。");
      }
    } catch (error) {
      console.error(error);
      alert("ESP32との通信に失敗しました。");
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

  const selectedCount = tools.reduce((sum, t) => sum + t.quantity, 0);

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-4rem)]">
        <div className="container-app grid min-h-[calc(100vh-4rem)] max-w-md place-items-center py-16">
          <div className="card card-pad w-full text-center">
            <div
              className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl text-white"
              style={{ background: "var(--brand)" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2M4 8h16M4 8v10a2 2 0 002 2h12a2 2 0 002-2V8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              工具を借りるにはログインが必要です
            </h1>
            <p className="mt-2 text-sm text-muted">
              社員QRコードをかざしてログインしてください。
            </p>
            <button
              onClick={() => router.push("/qr")}
              className="btn btn-primary mt-6 w-full"
            >
              QRコードでログイン
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] pb-28">
      <div className="container-app max-w-3xl py-8">
        {unlockMessage && (
          <p className="banner banner-info mb-6 text-center">{unlockMessage}</p>
        )}

        {myRentals.length > 0 && (
          <section className="mb-10">
            <h2 className="section-title mb-4">あなたが借りている工具</h2>

            <div className="space-y-3">
              {myRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="card card-pad flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">
                      {rental.tool.name}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      数量 {rental.quantity} ・ 貸出{" "}
                      {new Date(rental.borrowedAt).toLocaleString("ja-JP")}
                    </p>
                  </div>

                  <button
                    onClick={() => handleReturn(rental, rental.tool.boxId)}
                    className="btn btn-outline btn-sm flex-none"
                  >
                    返却する
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="section-title mb-4">工具を借りる</h2>

          <div className="space-y-3">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onIncrease={() => increase(tool.id)}
                onDecrease={() => decrease(tool.id)}
                disabled={!user}
              />
            ))}

            {tools.length === 0 && (
              <div className="card card-pad text-center text-muted">
                貸出できる工具がありません。
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 開錠バー（画面下に固定） */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur">
        <div className="container-app flex max-w-3xl items-center justify-between gap-4 py-3">
          <p className="text-sm text-muted">
            選択中{" "}
            <span className="font-bold text-foreground">{selectedCount}</span> 点
          </p>
          <button
            onClick={handleUnlock}
            disabled={selectedCount === 0}
            className="btn btn-primary"
          >
            開錠する
          </button>
        </div>
      </div>
    </main>
  );
}
