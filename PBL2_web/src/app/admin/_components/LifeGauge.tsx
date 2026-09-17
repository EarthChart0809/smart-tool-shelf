interface Props {
  useCount: number;
  lifeLimit: number;
}

export default function LifeGauge({ useCount, lifeLimit }: Props) {
  const percent = Math.min((useCount / lifeLimit) * 100, 100);
  const remaining = Math.max(lifeLimit - useCount, 0);

  // 緑: 0〜70% / 黄色: 70〜90% / 赤: 90%以上
  const barColor =
    percent >= 90
      ? "bg-red-500"
      : percent >= 70
        ? "bg-yellow-400"
        : "bg-green-500";

  return (
    <div className="w-48">
      <div className="mb-1 flex justify-between text-xs text-gray-500">
        <span>
          {useCount} / {lifeLimit}
        </span>
        <span>{percent >= 100 ? "交換推奨" : `残り${remaining}回`}</span>
      </div>

      <div className="h-3 w-full rounded bg-gray-200">
        <div
          className={`h-3 rounded ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
