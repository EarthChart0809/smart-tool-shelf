"use client";

import { useState } from "react";

export default function AiAnalysisPanel() {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const response = await fetch("/api/admin/ai-analysis", {
        method: "POST",
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message ?? "AI分析に失敗しました。");
        return;
      }

      setAnalysis(data.analysis);
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-8 rounded-lg border bg-white p-5 shadow">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold">🤖 AI分析</h2>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="rounded bg-purple-700 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "分析中..." : "AI分析を実行"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {analysis && (
        <div className="rounded bg-purple-50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {analysis}
        </div>
      )}

      {!analysis && !error && !loading && (
        <p className="text-sm text-gray-500">
          直近の貸出傾向・在庫状況・工具寿命をもとに、AIが注意点をまとめます。
        </p>
      )}
    </section>
  );
}
