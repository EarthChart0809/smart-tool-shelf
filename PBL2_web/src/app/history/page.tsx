"use client";

import { useEffect, useState } from "react";

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

    // 返却記録が完了したら、物理的にボックスを開けて工具を戻せるようにする
    await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ id: boxId, quantity: 1 }]),
    });

    alert(
      "扉が開きました。工具を戻して閉じてください(8秒後に自動施錠されます)",
    );

    await load();
  };

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container-app max-w-4xl py-8">
        <h1 className="page-title">貸出履歴</h1>
        <p className="mt-2 mb-6 text-sm text-muted">
          返却操作は、社員本人がQRコードでログインした画面から行ってください。
          {isAdmin && "（管理者としてログイン中のため、代理返却も可能です）"}
        </p>

        <div className="table-wrap">
          <table className="table-app">
            <thead>
              <tr>
                <th>工具</th>
                <th>借りた人</th>
                <th>数量</th>
                <th>貸出日時</th>
                <th>状態</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>

            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id}>
                  <td className="font-medium">{rental.tool.name}</td>
                  <td>{rental.user.name}</td>
                  <td className="tabular-nums">{rental.quantity}</td>
                  <td className="text-muted">
                    {new Date(rental.borrowedAt).toLocaleString("ja-JP")}
                  </td>
                  <td>
                    {rental.returnedAt ? (
                      <span className="badge badge-muted">返却済み</span>
                    ) : (
                      <span className="badge badge-out">貸出中</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td>
                      {!rental.returnedAt && (
                        <button
                          onClick={() =>
                            handleAdminReturn(rental.id, rental.tool.boxId)
                          }
                          className="btn btn-outline btn-sm"
                        >
                          代理返却
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {rentals.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="py-10 text-center text-muted"
                  >
                    貸出履歴がありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
