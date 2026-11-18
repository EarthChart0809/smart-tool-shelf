"use client";

import ShelfViewer from "./ShelfViewer";
import { useDrawerStates } from "./useDrawerStates";

/**
 * ShelfGuide — 貸出・返却画面の「棚の案内」（見た目専用のコンポーネント）
 * 選んだ工具が入っている引き出しと、いま開いている引き出しを赤く光らせ、
 * その引き出しだけを一覧で示す。利用者が「どこを開ければよいか」を迷わないための表示。
 */
interface Props {
  // 選択中の工具（quantity > 0 のものが対象）
  tools: { id: number; name: string; boxId: number; quantity: number }[];
}

export default function ShelfGuide({ tools }: Props) {
  const { states, online, loaded } = useDrawerStates();

  const selected = tools.filter((tool) => tool.quantity > 0);

  // センサー未接続のときは、最後に届いた古い開閉状態は使わない（利用者を迷わせるため）
  const liveStates = online ? states : {};
  const openIds = Object.keys(liveStates)
    .map(Number)
    .filter((id) => liveStates[id]);

  // 取り出す引き出し + いま開いている引き出し（返却で開いたものも含む）
  const targetIds = Array.from(
    new Set([...selected.map((tool) => tool.boxId), ...openIds]),
  ).sort((a, b) => a - b);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="section-title">工具棚</h2>
        {loaded && (
          <span className={`badge ${online ? "badge-ok" : "badge-muted"}`}>
            {online ? "センサー接続中" : "センサー未接続"}
          </span>
        )}
      </div>

      <div className="p-2">
        <ShelfViewer
          className="h-[260px] w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface-2)] lg:h-[340px]"
          drawerStates={liveStates}
          highlightIds={targetIds}
        />
      </div>

      {targetIds.length === 0 ? (
        <p className="text-muted px-5 pt-1 pb-4 text-sm">
          工具を選ぶと、取り出す引き出しが赤く表示されます。
        </p>
      ) : (
        <ul className="border-t border-[var(--line)]">
          {targetIds.map((id) => {
            const inDrawer = selected.filter((tool) => tool.boxId === id);
            const isOpen = liveStates[id];

            return (
              <li
                key={id}
                className="panel-row flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-[var(--radius-sm)] bg-[var(--brand)] font-bold text-white tabular-nums">
                    {id}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold">引き出し {id}</p>
                    <p className="text-muted truncate text-xs">
                      {inDrawer.length > 0
                        ? inDrawer
                            .map((tool) => `${tool.name} ×${tool.quantity}`)
                            .join("、")
                        : "返却・取り出し中"}
                    </p>
                  </div>
                </div>

                {online && (
                  <span
                    className={`badge flex-none ${isOpen ? "badge-warn" : "badge-muted"}`}
                  >
                    {isOpen ? "開いています" : "閉まっています"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
