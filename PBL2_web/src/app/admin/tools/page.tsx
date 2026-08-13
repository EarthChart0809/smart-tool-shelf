"use client";

import { useEffect, useState } from "react";
import LifeGauge from "@/app/admin/_components/LifeGauge";

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
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">工具管理</h1>

      <div className="mb-8 flex flex-wrap gap-3 rounded-lg border bg-white p-5 shadow">
        <input
          className="flex-1 rounded border p-2"
          placeholder="工具名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-24 rounded border p-2"
          placeholder="在庫数"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        <input
          className="w-28 rounded border p-2"
          placeholder="ボックスID"
          type="number"
          value={boxId}
          onChange={(e) => setBoxId(e.target.value)}
        />
        <input
          className="w-32 rounded border p-2"
          placeholder="交換推奨回数"
          type="number"
          value={lifeLimit}
          onChange={(e) => setLifeLimit(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="rounded bg-blue-700 px-4 text-white"
        >
          追加
        </button>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <div className="space-y-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow"
          >
            <div>
              <p className="font-bold">{tool.name}</p>
              <p className="text-sm text-gray-500">ボックスID: {tool.boxId}</p>
            </div>

            <LifeGauge useCount={tool.useCount} lifeLimit={tool.lifeLimit} />

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-500">在庫:</label>
              <input
                type="number"
                defaultValue={tool.stock}
                className="w-16 rounded border p-1 text-center"
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
                className="rounded bg-red-600 px-3 py-1 text-sm text-white"
              >
                削除
              </button>
            </div>
          </div>
        ))}

        {tools.length === 0 && (
          <p className="text-gray-500">工具が登録されていません。</p>
        )}
      </div>
    </main>
  );
}
