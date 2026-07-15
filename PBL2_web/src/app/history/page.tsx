"use client";

import { useEffect, useState } from "react";
import Header from "@/app/_components/Header";

interface RentalWithRelations {
  id: number;
  quantity: number;
  borrowedAt: string;
  returnedAt: string | null;
  user: { name: string; employeeId: string };
  tool: { name: string };
}

export default function HistoryPage() {
  const [rentals, setRentals] = useState<RentalWithRelations[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const response = await fetch("/api/rentals");
    const data = await response.json();
    setRentals(data);
  };

  const handleReturn = async (rentalId: number) => {
    const response = await fetch("/api/rentals", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rentalId }),
    });

    const data = await response.json();

    if (!data.success) {
      alert(data.message ?? "返却に失敗しました。");
      return;
    }

    await load();
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-3xl font-bold">貸出履歴</h1>

        <div className="overflow-hidden rounded-lg border bg-white shadow">
          <table className="w-full text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">工具</th>
                <th className="p-3">借りた人</th>
                <th className="p-3">数量</th>
                <th className="p-3">貸出日時</th>
                <th className="p-3">状態</th>
                <th className="p-3"></th>
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
                  <td className="p-3">
                    {!rental.returnedAt && (
                      <button
                        onClick={() => handleReturn(rental.id)}
                        className="rounded bg-blue-600 px-3 py-1 text-white"
                      >
                        返却する
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
