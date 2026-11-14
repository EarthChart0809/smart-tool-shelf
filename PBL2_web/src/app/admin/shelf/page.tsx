"use client";

import ShelfViewer from "@/app/_components/shelf/ShelfViewer";
import { useDrawerStates } from "@/app/_components/shelf/useDrawerStates";

const DRAWER_IDS = [1, 2];

export default function AdminShelfPage() {
  const { states, online, loaded } = useDrawerStates();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-3xl font-bold">3D工具棚</h1>

        {loaded && (
          <span
            className={`rounded px-3 py-1 text-sm ${
              online
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {online ? "センサー接続中" : "センサー未接続(最後の状態を表示)"}
          </span>
        )}
      </div>

      <p className="mb-6 text-sm text-gray-500">
        ドラッグで回転、スクロールで拡大・縮小できます。
      </p>

      <ShelfViewer
        className="h-[520px] w-full overflow-hidden rounded-lg border bg-gray-100"
        drawerStates={states}
      />

      <div className="mt-4 flex gap-3">
        {DRAWER_IDS.map((id) => (
          <div
            key={id}
            className={`rounded-lg border px-4 py-2 text-sm ${
              states[id]
                ? "border-orange-300 bg-orange-50 text-orange-800"
                : "bg-white text-gray-700"
            }`}
          >
            引き出し{id}: {states[id] ? "開" : "閉"}
          </div>
        ))}
      </div>
    </main>
  );
}