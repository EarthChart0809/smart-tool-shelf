"use client";

import { useEffect, useState } from "react";
import HourlyChart from "@/app/admin/_components/HourlyChart";

interface RentalSummary {
  id: number;
  quantity: number;
  borrowedAt: string;
  returnedAt: string | null;
  user: { name: string };
  tool: { name: string };
}

interface DashboardData {
  todayBorrowedCount: number;
  todayReturnedCount: number;
  currentlyBorrowedCount: number;
  lowStockTools: { id: number; name: string; stock: number }[];
  criticalTools: {
    id: number;
    name: string;
    useCount: number;
    lifeLimit: number;
  }[];
  employeeCount: number;
  toolCount: number;
  recentBorrows: RentalSummary[];
  recentReturns: RentalSummary[];
}

interface HourlyData {
  totalCount: number;
  hourly: { hour: number; count: number }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyData | null>(null);
  const [days, setDays] = useState<string>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadHourly(days);
  }, [days]);

  const load = async () => {
    const response = await fetch("/api/admin/dashboard");
    const json = await response.json();

    if (!response.ok) {
      setError(json.message ?? "読み込みに失敗しました。");
      return;
    }

    setData(json);
  };

  const loadHourly = async (daysValue: string) => {
    const query = daysValue === "all" ? "" : `?days=${daysValue}`;
    const response = await fetch(`/api/admin/hourly-stats${query}`);
    const json = await response.json();

    if (response.ok) {
      setHourlyData(json);
    }
  };

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="p-6 text-gray-500">読み込み中...</p>;
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">管理ダッシュボード</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon="📦"
          label="今日の貸出"
          value={`${data.todayBorrowedCount}件`}
        />
        <StatCard
          icon="🔄"
          label="今日の返却"
          value={`${data.todayReturnedCount}件`}
        />
        <StatCard
          icon="🧰"
          label="現在貸出中"
          value={`${data.currentlyBorrowedCount}個`}
        />
        <StatCard
          icon="⚠"
          label="在庫不足"
          value={`${data.lowStockTools.length}種類`}
          alert={data.lowStockTools.length > 0}
        />
        <StatCard
          icon="👤"
          label="登録社員数"
          value={`${data.employeeCount}人`}
        />
        <StatCard
          icon="🔧"
          label="登録工具数"
          value={`${data.toolCount}種類`}
        />
        <StatCard
          icon="🛠"
          label="要交換間近"
          value={`${data.criticalTools.length}種類`}
          alert={data.criticalTools.length > 0}
        />
      </div>

      {data.lowStockTools.length > 0 && (
        <section className="mb-8 rounded-lg border border-red-300 bg-red-50 p-4">
          <h2 className="mb-2 font-bold text-red-700">⚠ 在庫不足の工具</h2>
          <ul className="space-y-1 text-sm">
            {data.lowStockTools.map((tool) => (
              <li key={tool.id}>
                {tool.name} — 残り{tool.stock}個
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.criticalTools.length > 0 && (
        <section className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <h2 className="mb-2 font-bold text-amber-700">🛠 要交換間近の工具</h2>
          <ul className="space-y-1 text-sm">
            {data.criticalTools.map((tool) => (
              <li key={tool.id}>
                {tool.name} — 使用 {tool.useCount}/{tool.lifeLimit}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-8 rounded-lg border bg-white p-5 shadow">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">時間帯別の貸出傾向</h2>

          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="rounded border p-1 text-sm"
          >
            <option value="all">全期間</option>
            <option value="7">直近7日</option>
            <option value="30">直近30日</option>
          </select>
        </div>

        {hourlyData ? (
          hourlyData.totalCount > 0 ? (
            <HourlyChart hourly={hourlyData.hourly} />
          ) : (
            <p className="text-sm text-gray-500">
              該当期間のデータがありません。
            </p>
          )
        ) : (
          <p className="text-sm text-gray-500">読み込み中...</p>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xl font-bold">最近の貸出履歴</h2>
          <RentalList rentals={data.recentBorrows} dateField="borrowedAt" />
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">最近の返却履歴</h2>
          <RentalList rentals={data.recentReturns} dateField="returnedAt" />
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  alert = false,
}: {
  icon: string;
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 text-center shadow ${
        alert ? "border-red-300 bg-red-50" : "bg-white"
      }`}
    >
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function RentalList({
  rentals,
  dateField,
}: {
  rentals: RentalSummary[];
  dateField: "borrowedAt" | "returnedAt";
}) {
  if (rentals.length === 0) {
    return <p className="text-sm text-gray-500">履歴がありません。</p>;
  }

  return (
    <ul className="space-y-2">
      {rentals.map((rental) => {
        const date = rental[dateField];
        return (
          <li
            key={rental.id}
            className="rounded-lg border bg-white p-3 text-sm shadow"
          >
            <span className="font-bold">{rental.tool.name}</span>
            <span className="text-gray-500">
              {" "}
              × {rental.quantity} — {rental.user.name}
            </span>
            <div className="text-xs text-gray-400">
              {date ? new Date(date).toLocaleString("ja-JP") : ""}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
