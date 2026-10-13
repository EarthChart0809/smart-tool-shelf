"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandHolding,
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

  // 要確認 = 在庫不足 + 交換間近
  const attentionCount = data.lowStockTools.length + data.criticalTools.length;

  // 最近の操作: 貸出と返却を1つのリストにまとめて新しい順に並べる
  const recentActions = [
    ...data.recentBorrows.map((rental) => ({
      key: `b-${rental.id}`,
      rental,
      type: "貸出" as const,
      date: rental.borrowedAt,
    })),
    ...data.recentReturns.map((rental) => ({
      key: `r-${rental.id}`,
      rental,
      type: "返却" as const,
      date: rental.returnedAt ?? rental.borrowedAt,
    })),
  ].sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());

  return (
    <main className="container-app max-w-6xl py-8">
      <div>
        <h1 className="page-title">ダッシュボード</h1>
        <p className="page-desc flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-foreground font-bold">{today}</span>
          <span>
            今日の貸出{" "}
            <b className="text-foreground">{data.todayBorrowedCount}</b>
            件／返却{" "}
            <b className="text-foreground">{data.todayReturnedCount}</b>件
          </span>
          <span>
            登録社員 <b className="text-foreground">{data.employeeCount}</b>人
          </span>
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={faToolbox}
          label="工具"
          value={data.toolCount}
          unit="種類"
        />
        <StatCard
          icon={faHandHolding}
          label="貸出"
          value={data.currentlyBorrowedCount}
          unit="個"
        />
        <StatCard
          icon={faTriangleExclamation}
          label="要確認"
          value={attentionCount}
          unit="件"
          tone={attentionCount > 0 ? "alert" : undefined}
        />
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[3fr_2fr]">
        {/* 最近の操作 */}
        <section className="panel">
          <div className="panel-head">
            <h2 className="section-title">最近の操作</h2>
          </div>

          {recentActions.length === 0 && (
            <p className="panel-body text-muted text-sm">履歴がありません。</p>
          )}

          <ul>
            {recentActions.map(({ key, rental, type, date }) => (
              <li
                key={key}
                className="panel-row grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="avatar avatar-neutral h-7 w-7 text-xs">
                    {rental.user.name?.charAt(0) ?? "?"}
                  </span>
                  <span className="truncate">{rental.user.name}</span>
                </span>
                <span className="min-w-0 truncate font-bold">
                  {rental.tool.name}
                  <span className="text-muted ml-1 font-normal">
                    × {rental.quantity}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-muted hidden text-xs tabular-nums sm:inline">
                    {new Date(date).toLocaleString("ja-JP")}
                  </span>
                  <span
                    className={`badge ${type === "貸出" ? "badge-out" : "badge-muted"}`}
                  >
                    {type}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* 要確認の内訳 */}
        <section className="panel">
          <div className="panel-head">
            <h2 className="section-title">
              要確認
              <span className="count">{attentionCount}</span>
            </h2>
          </div>

          {attentionCount === 0 && (
            <p className="panel-body text-muted text-sm">
              対応が必要な工具はありません。
            </p>
          )}

          {data.lowStockTools.map((tool) => (
            <div
              key={`stock-${tool.id}`}
              className="panel-row flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{tool.name}</p>
                <p className="text-muted text-xs">残り {tool.stock} 個</p>
              </div>
              <span className="badge badge-out">在庫不足</span>
            </div>
          ))}
          {data.criticalTools.map((tool) => (
            <div key={`life-${tool.id}`} className="panel-row space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold">{tool.name}</p>
                <span className="badge badge-warn">交換間近</span>
              </div>
              <LifeMeter useCount={tool.useCount} lifeLimit={tool.lifeLimit} />
            </div>
          ))}
        </section>
      </div>

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
                  <div className="chart-bars">
                    {hourly.map(({ hour, count }, i) => (
                      <div
                        key={hour}
                        title={`${hour}時台: ${count}件`}
                        className={`chart-bar ${peak && hour === peak.hour ? "chart-bar-peak" : ""}`}
                        style={{
                          height: `${(count / maxCount) * 100}%`,
                          animationDelay: `${i * 18}ms`,
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

        <div className="skin">
          <AiAnalysisPanel />
        </div>
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
    <div className={`stat ${tone === "alert" ? "stat-alert" : ""}`}>
      <span
        className={`icon-tile h-12 w-12 ${tone === "alert" ? "" : "icon-tile-neutral"}`}
      >
        <FontAwesomeIcon icon={icon} />
      </span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">
          {value}
          <span className="stat-unit">{unit}</span>
        </p>
      </div>
    </div>
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
