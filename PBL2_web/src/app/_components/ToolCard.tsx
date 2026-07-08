import { Tool } from "@/app/types/tool";

interface Props {
  tool: Tool;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function ToolCard({ tool, onIncrease, onDecrease }: Props) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-bold">{tool.name}</h2>

          <p className="text-gray-600">在庫：{tool.stock}</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onDecrease} className="h-8 w-8 rounded bg-gray-300">
            -
          </button>

          <span className="w-8 text-center text-xl">{tool.quantity}</span>

          <button
            onClick={onIncrease}
            className="h-8 w-8 rounded bg-green-600 text-white"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
