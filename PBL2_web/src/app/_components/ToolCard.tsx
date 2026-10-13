import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
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
      className={`card relative flex flex-col gap-4 p-5 transition ${
        selected ? "card-selected" : ""
      } ${outOfStock ? "card-disabled" : ""}`}
    >
      {/* 選択中のチェック */}
      {selected && (
        <span className="absolute top-4 right-4 grid h-6 w-6 place-items-center rounded-full bg-[var(--brand)] text-[0.65rem] text-white shadow-[0_4px_10px_-2px_var(--brand-glow)]">
          <FontAwesomeIcon icon={faCheck} />
        </span>
      )}

      <div className="min-w-0 pr-8">
        <p className="text-muted text-xs">ボックス {tool.boxId}</p>
        <h3
          className={`mt-1 truncate text-lg font-bold ${outOfStock ? "text-muted" : ""}`}
        >
          {tool.name}
        </h3>
        <div className="mt-1.5">
          {outOfStock ? (
            <span className="badge badge-out">在庫なし</span>
          ) : (
            <span className="badge badge-ok">在庫 {tool.stock}</span>
          )}
        </div>
      </div>

      {/* 数量ステッパー */}
      <div className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] p-1.5">
        <button
          onClick={onDecrease}
          disabled={disabled || tool.quantity <= 0}
          className="btn-step"
          aria-label="数量を減らす"
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>

        <span
          className={`text-2xl font-extrabold tabular-nums ${selected ? "text-[var(--brand)]" : "text-muted-2"}`}
        >
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
