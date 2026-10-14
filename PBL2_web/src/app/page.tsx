"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faCamera,
  faClockRotateLeft,
  faQrcode,
  faRotateLeft,
  faToolbox,
  faUnlock,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
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
    // 工具一覧が取得できていればサーバーと通信できている
    const online = tools.length > 0;

    return (
      <main className="container-app flex min-h-screen max-w-md flex-col justify-center py-12 text-center">
        <div>
          <p className="text-muted flex items-center justify-center gap-2 text-sm font-bold">
            <Image src="/crescent.svg" alt="" width={18} height={18} />
            Smart Tool Shelf
          </p>
          <h1 className="page-title mt-3 text-3xl sm:text-4xl">
            工具を借りる・返す
          </h1>
        </div>

        {/* メイン: QRコードでログイン */}
        <button
          onClick={() => router.push("/qr")}
          className="card card-interactive group mt-9 flex w-full flex-col items-center gap-4 px-6 py-10"
        >
          <span className="relative grid h-24 w-24 place-items-center rounded-3xl bg-[var(--brand-soft)] text-5xl text-[var(--brand)] transition group-hover:scale-105">
            <FontAwesomeIcon icon={faQrcode} />
            <span className="absolute -right-1 -bottom-1 grid h-9 w-9 place-items-center rounded-full border-4 border-white bg-[var(--foreground)] text-sm text-white">
              <FontAwesomeIcon icon={faCamera} />
            </span>
          </span>
          <span className="text-xl font-bold">QRコードでログイン</span>
          <span className="text-muted text-sm">
            社員QRコードをカメラにかざしてください
          </span>
          <span className="btn btn-primary btn-lg mt-2 w-full max-w-xs">
            <FontAwesomeIcon icon={faCamera} />
            カメラを起動
          </span>
        </button>

        {/* サブ: 貸出履歴 / 管理者 */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            href="/history"
            className="card card-interactive flex items-center justify-center gap-2.5 py-4 text-sm font-bold"
          >
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-muted" />
            貸出履歴
          </Link>
          <Link
            href="/admin/login"
            className="card card-interactive text-muted flex items-center justify-center gap-2.5 py-4 text-sm"
          >
            <FontAwesomeIcon icon={faUserGear} />
            管理者
          </Link>
        </div>

        {/* システムの状態 */}
        <p className="text-muted mt-10 inline-flex items-center justify-center gap-2 self-center rounded-full border border-[var(--line)] bg-white px-3.5 py-1.5 text-xs shadow-[var(--shadow-1)]">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: online ? "var(--ok)" : "var(--muted-2)" }}
          />
          {online ? "サーバーに接続済み" : "サーバーに接続しています…"}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-36">
      <div className="container-app max-w-4xl py-8">
        {/* あいさつ + 操作 */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="avatar h-12 w-12 text-lg">
              {user.name?.charAt(0) ?? "?"}
            </span>
            <div>
              <p className="text-muted text-xs">ようこそ</p>
              <p className="text-xl font-bold">{user.name} さん</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        <div className="mt-8">
          <h1 className="page-title">工具を借りる</h1>
          <p className="page-desc">
            借りたい工具の数を選んで、画面下の「開錠する」を押してください。
          </p>
        </div>

        {unlockMessage && (
          <p className="banner banner-ok mt-6 justify-center text-base font-bold">
            <FontAwesomeIcon icon={faUnlock} />
            {unlockMessage}
          </p>
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
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="icon-tile icon-tile-neutral">
                      <FontAwesomeIcon icon={faToolbox} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold">
                        {rental.tool.name}
                        <span className="text-muted ml-2 text-sm font-normal">
                          × {rental.quantity}
                        </span>
                      </p>
                      <p className="text-muted text-xs tabular-nums">
                        {new Date(rental.borrowedAt).toLocaleString("ja-JP")}{" "}
                        に貸出 ／ ボックス {rental.tool.boxId}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReturn(rental, rental.tool.boxId)}
                    className="btn btn-outline flex-none"
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
          <h2 className="section-title mb-3">
            工具一覧
            <span className="count">{tools.length}</span>
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
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
              <div className="card card-pad text-muted col-span-full text-center">
                貸出できる工具がありません。
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 開錠パネル（画面下に浮かせて固定） */}
      <div className="fixed inset-x-0 bottom-0 z-20 px-3 pb-3 sm:px-6 sm:pb-5">
        <div className="action-dock mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-muted text-xs font-bold">選択中</span>
            <span
              className={`text-3xl font-extrabold tabular-nums ${selectedCount > 0 ? "text-[var(--brand)]" : "text-muted-2"}`}
            >
              {selectedCount}
            </span>
            <span className="text-muted text-sm">点</span>
          </div>
          <button
            onClick={handleUnlock}
            disabled={selectedCount === 0}
            className="btn btn-primary btn-lg min-w-[11rem]"
          >
            <FontAwesomeIcon icon={faUnlock} />
            開錠する
          </button>
        </div>
      </div>
    </main>
  );
}
