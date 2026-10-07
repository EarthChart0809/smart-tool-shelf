"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBoxOpen,
  faRotateLeft,
  faToolbox,
  faTriangleExclamation,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import AiAnalysisPanel from "@/app/admin/_components/AiAnalysisPanel";

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
    return (
      <main className="container-app max-w-5xl py-8">
        <p className="banner banner-error">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <p className="text-muted flex items-center justify-center gap-2 py-24 text-sm">
        <span className="spinner" />
        読み込み中...
      </p>
    );
  }

  const today = new Date().toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  // 時間帯別グラフ: いちばん多い時間帯を赤で強調する
  const hourly = hourlyData?.hourly ?? [];
  const maxCount = Math.max(...hourly.map((h) => h.count), 0);
  const peak = hourly.find((h) => h.count === maxCount && maxCount > 0);

  const needsAttention =
    data.lowStockTools.length > 0 || data.criticalTools.length > 0;

  return (
    <main className="container-app max-w-5xl py-8">
      <h1 className="page-title">ダッシュボード</h1>
      <p className="page-desc">
        {today}　登録社員 {data.employeeCount}人／登録工具 {data.toolCount}種類
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={faArrowRightFromBracket}
          label="今日の貸出"
          value={data.todayBorrowedCount}
          unit="件"
        />
        <StatCard
          icon={faRotateLeft}
          label="今日の返却"
          value={data.todayReturnedCount}
          unit="件"
        />
        <StatCard
          icon={faToolbox}
          label="現在貸出中"
          value={data.currentlyBorrowedCount}
          unit="個"
        />
        <StatCard
          icon={faBoxOpen}
          label="在庫不足"
          value={data.lowStockTools.length}
          unit="種類"
          tone={data.lowStockTools.length > 0 ? "alert" : undefined}
        />
        <StatCard
          icon={faTriangleExclamation}
          label="要交換間近"
          value={data.criticalTools.length}
          unit="種類"
          tone={data.criticalTools.length > 0 ? "warn" : undefined}
        />
      </div>

      {needsAttention && (
        <section className="panel mt-5">
          <div className="panel-head">
            <h2 className="section-title">対応が必要な工具</h2>
          </div>
          {data.lowStockTools.map((tool) => (
            <div
              key={`stock-${tool.id}`}
              className="panel-row flex items-center justify-between gap-4"
            >
              <p className="font-bold">{tool.name}</p>
              <div className="flex items-center gap-3">
                <span className="text-muted text-sm">残り {tool.stock} 個</span>
                <span className="badge badge-out">在庫不足</span>
              </div>
            </div>
          ))}
          {data.criticalTools.map((tool) => (
            <div
              key={`life-${tool.id}`}
              className="panel-row flex items-center justify-between gap-4"
            >
              <p className="font-bold">{tool.name}</p>
              <div className="flex items-center gap-3">
                <LifeMeter
                  useCount={tool.useCount}
                  lifeLimit={tool.lifeLimit}
                />
                <span className="badge badge-warn">交換間近</span>
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <section className="panel">
          <div className="panel-head">
            <h2 className="section-title">時間帯別の貸出傾向</h2>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="select"
            >
              <option value="all">全期間</option>
              <option value="7">直近7日</option>
              <option value="30">直近30日</option>
            </select>
          </div>

          <div className="panel-body">
            {hourlyData ? (
              hourlyData.totalCount > 0 ? (
                <>
                  <div className="border-line flex h-40 items-end gap-[3px] border-b">
                    {hourly.map(({ hour, count }) => (
                      <div
                        key={hour}
                        title={`${hour}時台: ${count}件`}
                        className="flex-1 rounded-t-sm"
                        style={{
                          height: `${(count / maxCount) * 100}%`,
                          background:
                            peak && hour === peak.hour
                              ? "var(--brand)"
                              : "#d9d9d9",
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-muted-2 mt-1 flex text-[0.65rem]">
                    {hourly.map(({ hour }) => (
                      <span key={hour} className="flex-1 text-center">
                        {hour % 3 === 0 ? hour : ""}
                      </span>
                    ))}
                  </div>
                  {peak && (
                    <p className="text-muted mt-3 text-xs">
                      一番多いのは{" "}
                      <span className="text-foreground font-bold">
                        {peak.hour}時台
                      </span>
                      （{peak.count}件）です。
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted text-sm">
                  該当期間のデータがありません。
                </p>
              )
            ) : (
              <p className="text-muted text-sm">読み込み中...</p>
            )}
          </div>
        </section>

        <AiAnalysisPanel />
      </div>

      <div className="mt-5 grid items-start gap-5 md:grid-cols-2">
        <section className="panel">
          <div className="panel-head">
            <h2 className="section-title">最近の貸出</h2>
          </div>
          <RentalList rentals={data.recentBorrows} dateField="borrowedAt" />
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2 className="section-title">最近の返却</h2>
          </div>
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
  unit,
  tone,
}: {
  icon: IconDefinition;
  label: string;
  value: number;
  unit: string;
  tone?: "alert" | "warn";
}) {
  return (
    <div
      className={`stat ${tone === "alert" ? "stat-alert" : ""} ${
        tone === "warn" ? "stat-warn" : ""
      }`}
    >
      <p className="stat-label">
        <FontAwesomeIcon icon={icon} />
        {label}
      </p>
      <p className="stat-value">
        {value}
        <span className="stat-unit">{unit}</span>
      </p>
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
    return <p className="panel-body text-muted text-sm">履歴がありません。</p>;
  }

  return (
    <ul>
      {rentals.map((rental) => {
        const date = rental[dateField];
        return (
          <li
            key={rental.id}
            className="panel-row flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {rental.tool.name}
                <span className="text-muted ml-1 font-normal">
                  × {rental.quantity}
                </span>
              </p>
              <p className="text-muted text-xs">{rental.user.name}</p>
            </div>
            <span className="text-muted flex-none text-xs tabular-nums">
              {date ? new Date(date).toLocaleString("ja-JP") : ""}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function lifeColor(useCount: number, lifeLimit: number) {
  const percent = (useCount / lifeLimit) * 100;
  return percent >= 90
    ? "var(--brand)"
    : percent >= 70
      ? "var(--warn)"
      : "var(--ok)";
}

function LifeMeter({
  useCount,
  lifeLimit,
}: {
  useCount: number;
  lifeLimit: number;
}) {
  const percent = Math.min((useCount / lifeLimit) * 100, 100);
  const remaining = Math.max(lifeLimit - useCount, 0);
  const color = lifeColor(useCount, lifeLimit);

  return (
    <div className="w-full sm:w-44">
      <div className="text-muted mb-1 flex justify-between text-xs">
        <span>
          {useCount} / {lifeLimit} 回
        </span>
        <span style={percent >= 90 ? { color } : undefined}>
          {percent >= 100 ? "交換推奨" : `残り${remaining}回`}
        </span>
      </div>
      <div className="meter">
        <div
          className="meter-fill"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  );
}
