"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faRotate,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
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
    <main className="container-app max-w-5xl py-8">
      <h1 className="page-title">工具管理</h1>
      <p className="page-desc">
        工具の登録・在庫調整・交換の記録・削除ができます。
      </p>

      {/* 新規追加フォーム */}
      <section className="panel mt-6">
        <div className="panel-head">
          <h2 className="section-title">工具を追加</h2>
        </div>
        <div className="panel-body grid gap-3 sm:grid-cols-[1fr_6rem_6rem_auto] sm:items-end">
          <div>
            <label className="label">工具名</label>
            <input
              className="input"
              placeholder="例：電動ドライバー"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">在庫数</label>
            <input
              className="input"
              placeholder="0"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
          <div>
            <label className="label">ボックスID</label>
            <input
              className="input"
              placeholder="1"
              type="number"
              value={boxId}
              onChange={(e) => setBoxId(e.target.value)}
            />
          </div>
          <button onClick={handleAdd} className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} />
            追加
          </button>
        </div>
      </section>

      <div className="mt-5">
        <CsvUploader
          importEndpoint="/api/admin/tools/bulk"
          exportEndpoint="/api/admin/tools/export"
          templateHeaders={["name", "stock", "boxId", "lifeLimit"]}
          templateFileName="工具一括登録テンプレート.csv"
          description="1行目をヘッダー行(name, stock, boxId, lifeLimit)にしてください。lifeLimitは省略可能で、未指定なら200になります。"
          onComplete={load}
        />
      </div>

      {error && <p className="banner banner-error mb-4">{error}</p>}

      {/* 工具リスト */}
      <section className="panel">
        <div className="panel-head">
          <h2 className="section-title">
            登録済みの工具
            <span className="count">{tools.length}</span>
          </h2>
        </div>

        {tools.map((tool) => (
          <div
            key={tool.id}
            className="panel-row flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
              <div className="min-w-0 sm:w-40">
                <p className="truncate font-bold">{tool.name}</p>
                <p className="text-muted text-xs">ボックス {tool.boxId}</p>
              </div>
              <LifeMeter useCount={tool.useCount} lifeLimit={tool.lifeLimit} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-muted text-sm">在庫</label>
              <input
                type="number"
                defaultValue={tool.stock}
                className="input input-sm w-16 text-center"
                onBlur={(e) =>
                  handleStockChange(tool.id, Number(e.target.value))
                }
              />

              <label className="text-muted ml-2 text-sm">交換目安</label>
              <input
                type="number"
                defaultValue={tool.lifeLimit}
                className="input input-sm w-20 text-center"
                onBlur={(e) =>
                  handleLifeLimitChange(tool.id, Number(e.target.value))
                }
              />

              <button
                onClick={() => handleReplace(tool.id, tool.name)}
                className="btn btn-outline btn-sm ml-2"
              >
                <FontAwesomeIcon icon={faRotate} />
                交換した
              </button>

              <button
                onClick={() => handleDelete(tool.id)}
                className="btn btn-danger btn-sm"
              >
                <FontAwesomeIcon icon={faTrashCan} />
                削除
              </button>
            </div>
          </div>
        ))}

        {tools.length === 0 && (
          <p className="panel-body text-muted text-center text-sm">
            工具が登録されていません。
          </p>
        )}
      </section>
    </main>
  );
}

function lifeColor(useCount: number, lifeLimit: number) {
  const percent = (useCount / lifeLimit) * 100;
  return percent >= 90
    ? "var(--brand)"
    : percent >= 70
      ? "var(--warn)"
      : "var(--ok)";
}

function LifeMeter({
  useCount,
  lifeLimit,
}: {
  useCount: number;
  lifeLimit: number;
}) {
  const percent = Math.min((useCount / lifeLimit) * 100, 100);
  const remaining = Math.max(lifeLimit - useCount, 0);
  const color = lifeColor(useCount, lifeLimit);

  return (
    <div className="w-full sm:w-44">
      <div className="text-muted mb-1 flex justify-between text-xs">
        <span>
          {useCount} / {lifeLimit} 回
        </span>
        <span style={percent >= 90 ? { color } : undefined}>
          {percent >= 100 ? "交換推奨" : `残り${remaining}回`}
        </span>
      </div>
      <div className="meter">
        <div
          className="meter-fill"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  );
}
