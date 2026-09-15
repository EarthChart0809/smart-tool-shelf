import { Tool } from "@/app/types/tool";

interface Props {
  tool: Tool & { quantity: number };
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
}

export default function ToolCard({
  tool,
  onIncrease,
  onDecrease,
  disabled = false,
}: Props) {
  const outOfStock = tool.stock <= 0;

  return (
    <div className="card card-hover card-pad">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-foreground">
            {tool.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            {outOfStock ? (
              <span className="badge badge-out">在庫なし</span>
            ) : (
              <span className="badge badge-ok">在庫 {tool.stock}</span>
            )}
            <span className="text-xs text-muted">ボックス {tool.boxId}</span>
          </div>
        </div>

        <div className="flex flex-none items-center gap-3">
          <button
            onClick={onDecrease}
            disabled={disabled || tool.quantity <= 0}
            className="btn-step"
            aria-label="数量を減らす"
          >
            −
          </button>

          <span className="w-8 text-center text-xl font-bold tabular-nums">
            {tool.quantity}
          </span>

          <button
            onClick={onIncrease}
            disabled={disabled || outOfStock}
            className="btn-step"
            aria-label="数量を増やす"
            style={
              !disabled && !outOfStock
                ? { borderColor: "var(--brand)", color: "var(--brand)" }
                : undefined
            }
          >
            ＋
          </button>
        </div>
      </div>
    </div>
  );
}
