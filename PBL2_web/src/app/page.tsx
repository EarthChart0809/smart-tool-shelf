"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faClockRotateLeft,
  faRotateLeft,
  faUnlock,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import ToolCard from "@/app/_components/ToolCard";
import QRLogin from "@/app/qr/page";
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
  const { user, logout } = useAuth();

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

  const selectedCount = tools.reduce((sum, t) => sum + t.quantity, 0);

  if (!user) {
    return (
      <main className="py-10 sm:py-14">
        <div className="text-center">
          <p className="text-muted text-xs font-bold tracking-[0.3em]">
            SMART TOOL SHELF
          </p>
          <h1 className="page-title mt-2">工具を借りる・返す</h1>
        </div>

        {/* QRコードをかざすとそのままログイン */}
        <div className="mt-6">
          <QRLogin />
        </div>

        {/* サブ: 貸出履歴 / 管理者 */}
        <div className="container-app mt-6 grid max-w-md grid-cols-2 gap-3">
          <Link
            href="/history"
            className="card flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition hover:border-[var(--foreground)]"
          >
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-muted" />
            貸出履歴
          </Link>
          <Link
            href="/admin/login"
            className="card text-muted flex items-center justify-center gap-2 py-3.5 text-sm transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
          >
            <FontAwesomeIcon icon={faUserGear} />
            管理者
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28">
      <div className="container-app max-w-3xl py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="page-title">工具を借りる</h1>
            <p className="page-desc">
              借りたい工具の数を選んで、画面下の「開錠する」を押してください。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="mr-1 flex items-center gap-2 text-sm">
              <span className="bg-brand grid h-8 w-8 place-items-center rounded-full text-sm font-bold text-white">
                {user.name?.charAt(0) ?? "?"}
              </span>
              {user.name}
            </span>
            <Link href="/history" className="btn btn-outline btn-sm">
              <FontAwesomeIcon icon={faClockRotateLeft} />
              貸出履歴
            </Link>
            <button onClick={logout} className="btn btn-outline btn-sm">
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
              ログアウト
            </button>
          </div>
        </div>

        {unlockMessage && (
          <p className="banner banner-ok mt-6 text-center">{unlockMessage}</p>
        )}

        {myRentals.length > 0 && (
          <section className="mt-8">
            <h2 className="section-title mb-3">
              あなたが借りている工具
              <span className="count">{myRentals.length}</span>
            </h2>

            <div className="panel">
              {myRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="panel-row flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-bold">
                      {rental.tool.name}
                      <span className="text-muted ml-2 text-sm font-normal">
                        × {rental.quantity}
                      </span>
                    </p>
                    <p className="text-muted text-xs">
                      {new Date(rental.borrowedAt).toLocaleString("ja-JP")}{" "}
                      に貸出 ／ ボックス {rental.tool.boxId}
                    </p>
                  </div>

                  <button
                    onClick={() => handleReturn(rental, rental.tool.boxId)}
                    className="btn btn-outline btn-sm flex-none"
                  >
                    <FontAwesomeIcon icon={faRotateLeft} />
                    返却する
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="section-title mb-3">工具一覧</h2>

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
              <div className="card card-pad text-muted text-center">
                貸出できる工具がありません。
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 開錠バー（画面下に固定） */}
      <div className="border-line fixed inset-x-0 bottom-0 z-20 border-t bg-white">
        <div className="container-app flex max-w-3xl items-center justify-between gap-4 py-3">
          <p className="text-muted text-sm">
            選択中{" "}
            <span className="text-foreground text-2xl font-bold">
              {selectedCount}
            </span>{" "}
            点
          </p>
          <button
            onClick={handleUnlock}
            disabled={selectedCount === 0}
            className="btn btn-primary"
          >
            <FontAwesomeIcon icon={faUnlock} />
            開錠する
          </button>
        </div>
      </div>
    </main>
  );
}
