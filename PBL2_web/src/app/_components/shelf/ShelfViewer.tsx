"use client";

import dynamic from "next/dynamic";

const ShelfCanvas = dynamic(() => import("./ShelfCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-gray-500">
      3Dモデルを読み込み中...
    </div>
  ),
});

interface Props {
  className?: string;
  drawerStates?: Record<number, boolean>;
}

export default function ShelfViewer({ className, drawerStates }: Props) {
  return (
    <div
      className={
        className ??
        "h-[420px] w-full overflow-hidden rounded-lg border bg-gray-100"
      }
    >
      <ShelfCanvas drawerStates={drawerStates} />
    </div>
  );
}