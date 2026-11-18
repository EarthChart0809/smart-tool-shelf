"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faDoorOpen,
  faTriangleExclamation,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import ShelfViewer from "@/app/_components/shelf/ShelfViewer";
import { useDrawerStates } from "@/app/_components/shelf/useDrawerStates";

interface Tool {
  id: number;
  name: string;
  stock: number;
  boxId: number;
  lifeLimit: number;
  useCount: number;
}

// 交換が近いとみなす使用回数の割合（工具管理・ダッシュボードの色分けと同じ 90%）
const LIFE_WARN_RATIO = 0.9;

export default function AdminShelfPage() {
  const { states, online, loaded } = useDrawerStates();
  const [tools, setTools] = useState<Tool[]>([]);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/admin/tools");
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "工具の読み込みに失敗しました。");
        return;
      }

      setTools(data);
    };

    load();
  }, []);

  // 引き出しの一覧 = 工具が入っている引き出し + センサーが報告している引き出し
  const drawerIds = Array.from(
    new Set([
      ...tools.map((tool) => tool.boxId),
      ...Object.keys(states).map(Number),
    ]),
  ).sort((a, b) => a - b);

  const drawers = drawerIds.map((id) => {
    const inDrawer = tools.filter((tool) => tool.boxId === id);
    const issues: string[] = [];
    if (states[id]) issues.push("開いたまま");
    if (inDrawer.some((tool) => tool.stock <= 0)) issues.push("在庫なし");
    if (
      inDrawer.some((tool) => tool.useCount >= tool.lifeLimit * LIFE_WARN_RATIO)
    )
      issues.push("交換間近");
    return { id, tools: inDrawer, isOpen: !!states[id], issues };
  });

  const openCount = drawers.filter((drawer) => drawer.isOpen).length;
  const attention = drawers.filter((drawer) => drawer.issues.length > 0);

  // 選んだ引き出しがあればそれだけ、なければ要確認の引き出しを赤く光らせる
  const highlightIds =
    selectedId !== null ? [selectedId] : attention.map((drawer) => drawer.id);

  return (
    <main className="container-app max-w-6xl py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">工具棚</h1>
          <p className="page-desc">
            棚全体と、すべての引き出しの状態を確認できます。
          </p>
        </div>
        {loaded && (
          <span className={`badge ${online ? "badge-ok" : "badge-out"}`}>
            {online ? "センサー接続中" : "センサー未接続"}
          </span>
        )}
      </div>

      {error && <p className="banner banner-error mt-6">{error}</p>}

      {loaded && !online && (
        <p className="banner banner-warn mt-6">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          センサーから30秒以上報告がありません。表示は最後に届いた状態です。棚の電源とWi-Fiを確認してください。
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={faBoxesStacked}
          label="引き出し"
          value={drawers.length}
          unit="個"
        />
        <StatCard
          icon={faDoorOpen}
          label="開いている"
          value={openCount}
          unit="個"
          alert={openCount > 0}
        />
        <StatCard
          icon={faTriangleExclamation}
          label="要確認"
          value={attention.length}
          unit="個"
          alert={attention.length > 0}
        />
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="panel">
          <div className="panel-head">
            <h2 className="section-title">棚の様子</h2>
            <span className="text-muted text-xs">
              ドラッグで回転、スクロールで拡大・縮小
            </span>
          </div>
          <div className="p-2">
            <ShelfViewer
              className="h-[320px] w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface-2)] lg:h-[480px]"
              drawerStates={states}
              highlightIds={highlightIds}
            />
          </div>
          <p className="text-muted px-5 pb-3 text-xs">
            {selectedId !== null
              ? `引き出し ${selectedId} を赤く表示しています。`
              : "要確認の引き出しを赤く表示しています。右の一覧で選ぶと、その引き出しだけを表示します。"}
          </p>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2 className="section-title">
              引き出し
              <span className="count">{drawers.length}</span>
            </h2>
            {selectedId !== null && (
              <button onClick={() => setSelectedId(null)} className="text-link">
                選択を解除
              </button>
            )}
          </div>

          {drawers.length === 0 && (
            <p className="panel-body text-muted text-sm">
              {loaded ? "引き出しの情報がありません。" : "読み込み中..."}
            </p>
          )}

          <ul>
            {drawers.map((drawer) => (
              <li key={drawer.id}>
                <button
                  onClick={() =>
                    setSelectedId(selectedId === drawer.id ? null : drawer.id)
                  }
                  aria-pressed={selectedId === drawer.id}
                  className={`panel-row flex w-full items-start gap-3 text-left ${
                    selectedId === drawer.id ? "bg-[var(--brand-soft)]" : ""
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 flex-none place-items-center rounded-[var(--radius-sm)] font-bold tabular-nums ${
                      drawer.issues.length > 0
                        ? "bg-[var(--brand)] text-white"
                        : "bg-[var(--surface-2)] text-[var(--foreground)]"
                    }`}
                  >
                    {drawer.id}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold">引き出し {drawer.id}</span>
                      <span
                        className={`badge ${drawer.isOpen ? "badge-warn" : "badge-muted"}`}
                      >
                        {drawer.isOpen ? "開" : "閉"}
                      </span>
                      {drawer.issues
                        .filter((issue) => issue !== "開いたまま")
                        .map((issue) => (
                          <span key={issue} className="badge badge-out">
                            {issue}
                          </span>
                        ))}
                    </span>
                    <span className="text-muted mt-1 block text-xs">
                      {drawer.tools.length > 0
                        ? drawer.tools
                            .map((tool) => `${tool.name}（在庫 ${tool.stock}）`)
                            .join("、")
                        : "工具が登録されていません"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
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
  alert = false,
}: {
  icon: IconDefinition;
  label: string;
  value: number;
  unit: string;
  alert?: boolean;
}) {
  return (
    <div className={`stat ${alert ? "stat-alert" : ""}`}>
      <span
        className={`icon-tile h-12 w-12 ${alert ? "" : "icon-tile-neutral"}`}
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
