"use client";

import { useEffect, useState } from "react";
import Header from "@/app/_components/Header";
import { unlockBoxesViaLan } from "@/lib/esp32-client";

interface RentalWithRelations {
  id: number;
  quantity: number;
  borrowedAt: string;
  returnedAt: string | null;
  user: { name: string; employeeId: string };
  tool: { name: string; boxId: number };
}

export default function HistoryPage() {
  const [rentals, setRentals] = useState<RentalWithRelations[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    load();
    checkAdmin();
  }, []);

  const load = async () => {
    const response = await fetch("/api/rentals");
    const data = await response.json();
    setRentals(data);
  };

  const checkAdmin = async () => {
    const response = await fetch("/api/admin/me");
    const data = await response.json();
    setIsAdmin(data.isAdmin);
  };

  const handleAdminReturn = async (rentalId: number, boxId: number) => {
    // userIdを付けずに送る = 管理者による代理返却(サーバー側でSupabaseログインを検証)
    const response = await fetch("/api/rentals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rentalId }),
    });

    const data = await response.json();

    if (!data.success) {
      alert(data.message ?? "返却に失敗しました。");
      return;
    }

    // 返却記録が完了したら、同一LAN内の端末からESP32へ直接解錠リクエスト
    const unlockResult = await unlockBoxesViaLan([{ id: boxId, quantity: 1 }]);

    if (!unlockResult.success) {
      alert(unlockResult.message ?? "解錠に失敗しました。");
      return;
    }

    alert(
      "扉が開きました。工具を戻して閉じてください(8秒後に自動施錠されます)",
    );

    await load();
  };

  return (
    <main className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-2 text-3xl font-bold">貸出履歴</h1>
        <p className="mb-6 text-sm text-gray-500">
          返却操作は、社員本人がQRコードでログインした画面から行ってください。
          {isAdmin && "(管理者としてログイン中のため、代理返却も可能です)"}
        </p>

        <div className="overflow-hidden rounded-lg border bg-white shadow">
          <table className="w-full text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">工具</th>
                <th className="p-3">借りた人</th>
                <th className="p-3">数量</th>
                <th className="p-3">貸出日時</th>
                <th className="p-3">状態</th>
                {isAdmin && <th className="p-3"></th>}
              </tr>
            </thead>

            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id} className="border-t">
                  <td className="p-3">{rental.tool.name}</td>
                  <td className="p-3">{rental.user.name}</td>
                  <td className="p-3">{rental.quantity}</td>
                  <td className="p-3">
                    {new Date(rental.borrowedAt).toLocaleString("ja-JP")}
                  </td>
                  <td className="p-3">
                    {rental.returnedAt ? "返却済み" : "貸出中"}
                  </td>
                  {isAdmin && (
                    <td className="p-3">
                      {!rental.returnedAt && (
                        <button
                          onClick={() => handleAdminReturn(rental.id, rental.tool.boxId)}
                          className="rounded bg-orange-600 px-3 py-1 text-white"
                        >
                          代理返却
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
