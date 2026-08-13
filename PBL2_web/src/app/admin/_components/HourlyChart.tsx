interface HourlyDatum {
  hour: number;
  count: number;
}

export default function HourlyChart({ hourly }: { hourly: HourlyDatum[] }) {
  const max = Math.max(...hourly.map((h) => h.count), 1);

  return (
    <div className="space-y-1">
      {hourly.map(({ hour, count }) => (
        <div key={hour} className="flex items-center gap-2 text-sm">
          <span className="w-10 shrink-0 text-right text-gray-500">
            {hour}時
          </span>

          <div className="h-4 flex-1 rounded bg-gray-100">
            <div
              className="h-4 rounded bg-blue-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>

          <span className="w-8 shrink-0 text-gray-600">{count}</span>
        </div>
      ))}
    </div>
  );
}
