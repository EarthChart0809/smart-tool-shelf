import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
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
  const selected = tool.quantity > 0;

  return (
    <div
      className={`card flex items-center justify-between gap-4 px-5 py-4 ${
        selected ? "card-selected" : ""
      } ${outOfStock ? "card-disabled" : ""}`}
    >
      <div className="min-w-0">
        <h3
          className={`truncate text-base font-bold ${outOfStock ? "text-muted" : ""}`}
        >
          {tool.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          {outOfStock ? (
            <span className="badge badge-out">在庫なし</span>
          ) : (
            <span className="badge badge-ok">在庫 {tool.stock}</span>
          )}
          <span className="text-muted text-xs">ボックス {tool.boxId}</span>
        </div>
      </div>

      <div className="flex flex-none items-center gap-3">
        <button
          onClick={onDecrease}
          disabled={disabled || tool.quantity <= 0}
          className="btn-step"
          aria-label="数量を減らす"
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>

        <span className="w-6 text-center text-lg font-bold tabular-nums">
          {tool.quantity}
        </span>

        <button
          onClick={onIncrease}
          disabled={disabled || outOfStock}
          className="btn-step btn-step-primary"
          aria-label="数量を増やす"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
    </div>
  );
}
