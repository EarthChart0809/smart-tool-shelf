"use client";

import { useEffect, useState } from "react";
import LifeGauge from "@/app/admin/_components/LifeGauge";
import CsvUploader from "@/app/admin/_components/CsvUploader";

interface Tool {
  id: number;
  name: string;
  stock: number;
  boxId: number;
  lifeLimit: number;
  useCount: number;
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [boxId, setBoxId] = useState("");
  const [lifeLimit, setLifeLimit] = useState("200");
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const response = await fetch("/api/admin/tools");
    const data = await response.json();

    if (!response.ok) {
      setError(data.message ?? "読み込みに失敗しました。");
      return;
    }

    setTools(data);
  };

  const handleAdd = async () => {
    setError("");

    const response = await fetch("/api/admin/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, stock, boxId, lifeLimit }),
    });

    const data = await response.json();

    if (!data.success) {
      setError(data.message ?? "追加に失敗しました。");
      return;
    }

    setName("");
    setStock("");
    setBoxId("");
    setLifeLimit("200");
    await load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この工具を削除しますか？")) return;

    const response = await fetch(`/api/admin/tools/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!data.success) {
      setError(data.message ?? "削除に失敗しました。");
      return;
    }

    await load();
  };

  const handleStockChange = async (id: number, stock: number) => {
    await fetch(`/api/admin/tools/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    });

    await load();
  };

  const handleLifeLimitChange = async (id: number, lifeLimit: number) => {
    await fetch(`/api/admin/tools/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lifeLimit }),
    });

    await load();
  };

  const handleReplace = async (id: number, name: string) => {
    if (!confirm(`${name} を交換済みとして使用回数をリセットしますか？`))
      return;

    await fetch(`/api/admin/tools/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replace: true }),
    });

    await load();
  };

  return (
    <main className="container-app max-w-3xl py-8">
      <h1 className="page-title">工具管理</h1>
      <p className="text-muted mt-2 mb-6 text-sm">
        工具の登録・在庫調整・削除ができます。
      </p>

      <CsvUploader
  importEndpoint="/api/admin/tools/bulk"
  exportEndpoint="/api/admin/tools/export"
  templateHeaders={["name", "stock", "boxId", "lifeLimit"]}
  templateFileName="工具一括登録テンプレート.csv"
  description="1行目をヘッダー行(name, stock, boxId, lifeLimit)にしてください。lifeLimitは省略可能で、未指定なら200になります。"
  onComplete={load}
/>

      {/* 新規追加フォーム */}
      <div className="card card-pad mb-8">
        <h2 className="section-title mb-4">工具を追加</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label">工具名</label>
            <input
              className="input"
              placeholder="例：電動ドライバー"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-24">
            <label className="label">在庫数</label>
            <input
              className="input"
              placeholder="0"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-28">
            <label className="label">ボックスID</label>
            <input
              className="input"
              placeholder="1"
              type="number"
              value={boxId}
              onChange={(e) => setBoxId(e.target.value)}
            />
          </div>
          <button onClick={handleAdd} className="btn btn-primary sm:flex-none">
            追加
          </button>
        </div>
      </div>

      {error && (
        <p
          className="banner banner-info mb-4 text-sm"
          style={{ fontWeight: 500 }}
        >
          {error}
        </p>
      )}

      {/* 工具リスト */}
      <div className="space-y-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="card card-pad flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="text-foreground font-bold">{tool.name}</p>
              <p className="text-muted mt-0.5 text-sm">
                ボックスID {tool.boxId}
              </p>
            </div>

            <div className="flex flex-none items-center gap-3">
              <label className="text-muted text-sm">在庫</label>
              <input
                type="number"
                defaultValue={tool.stock}
                className="input w-20 text-center"
                onBlur={(e) =>
                  handleStockChange(tool.id, Number(e.target.value))
                }
              />

              <label className="text-sm text-gray-500">交換推奨:</label>
              <input
                type="number"
                defaultValue={tool.lifeLimit}
                className="w-16 rounded border p-1 text-center"
                onBlur={(e) =>
                  handleLifeLimitChange(tool.id, Number(e.target.value))
                }
              />

              <button
                onClick={() => handleReplace(tool.id, tool.name)}
                className="rounded bg-green-600 px-3 py-1 text-sm text-white"
              >
                交換した
              </button>

              <button
                onClick={() => handleDelete(tool.id)}
                className="btn btn-danger btn-sm"
              >
                削除
              </button>
            </div>
          </div>
        ))}

        {tools.length === 0 && (
          <div className="card card-pad text-muted text-center">
            工具が登録されていません。
          </div>
        )}
      </div>
    </main>
  );
}
