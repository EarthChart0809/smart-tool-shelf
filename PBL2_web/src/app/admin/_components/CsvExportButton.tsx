"use client";

import { useState } from "react";

interface Props {
  endpoint: string;
  label?: string;
}

export default function CsvExportButton({
  endpoint,
  label = "CSVで出力",
}: Props) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setExporting(true);
    setError("");

    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        setError("エクスポートに失敗しました。");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match ? decodeURIComponent(match[1]) : "export.csv";

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
    } catch {
      setError("エクスポートに失敗しました。");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="rounded bg-gray-700 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {exporting ? "出力中..." : label}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
