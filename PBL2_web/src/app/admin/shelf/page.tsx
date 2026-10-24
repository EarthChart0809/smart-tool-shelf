import ShelfViewer from "@/app/_components/shelf/ShelfViewer";

export default function AdminShelfPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-3xl font-bold">3D工具棚</h1>
      <p className="mb-6 text-sm text-gray-500">
        ドラッグで回転、スクロールで拡大・縮小できます。
      </p>

      <ShelfViewer className="h-[520px] w-full overflow-hidden rounded-lg border bg-gray-100" />
    </main>
  );
}