"use client";

import dynamic from "next/dynamic";

const ShelfCanvas = dynamic(() => import("./ShelfCanvas"), {
  ssr: false,
  loading: () => (
    <div className="text-muted flex h-full items-center justify-center gap-2 text-sm">
      <span className="spinner" />
      3Dモデルを読み込み中...
    </div>
  ),
});

interface Props {
  className?: string;
  drawerStates?: Record<number, boolean>;
  highlightIds?: number[];
}

export default function ShelfViewer({
  className,
  drawerStates,
  highlightIds,
}: Props) {
  return (
    <div
      className={
        className ??
        "h-[420px] w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface-2)]"
      }
    >
      <ShelfCanvas drawerStates={drawerStates} highlightIds={highlightIds} />
    </div>
  );
}
