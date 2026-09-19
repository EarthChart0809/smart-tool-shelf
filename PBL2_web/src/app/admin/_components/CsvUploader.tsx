"use client";

import { useRef, useState } from "react";

interface Props {
  endpoint: string;
  templateHeaders: string[];
  templateFileName: string;
  description: string;
  onComplete: () => void;
}

export default function CsvUploader({
  endpoint,
  templateHeaders,
  templateFileName,
  description,
  onComplete,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    createdCount: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const csv = await file.text();

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message ?? "登録に失敗しました。");
        return;
      }

      setResult({ createdCount: data.createdCount, errors: data.errors });
      onComplete();
    } catch {
      setError("ファイルの読み込みに失敗しました。");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    // Excelで開いたときに文字化けしないようBOMを付与する
    const csv = "\uFEFF" + templateHeaders.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = templateFileName;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="mb-8 rounded-lg border bg-white p-5 shadow">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">CSVで一括登録</h2>

        <button
          onClick={downloadTemplate}
          className="text-sm text-blue-700 underline"
        >
          テンプレートをダウンロード
        </button>
      </div>

      <p className="mb-3 text-sm text-gray-500">{description}</p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        disabled={loading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="text-sm"
      />

      {loading && <p className="mt-3 text-sm text-gray-500">登録中...</p>}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-3 text-sm">
          <p className="text-green-700">
            {result.createdCount}件を登録しました。
          </p>

          {result.errors.length > 0 && (
            <div className="mt-2 rounded bg-orange-50 p-3">
              <p className="mb-1 font-bold text-orange-700">
                スキップした行({result.errors.length}件)
              </p>
              <ul className="space-y-1 text-orange-800">
                {result.errors.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
