"use client";

import { useEffect, useState } from "react";

interface Log {
  id: number;
  actorType: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  detail: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  RENTAL_CREATE: "貸出",
  RENTAL_RETURN: "返却",
  USER_CREATE: "社員登録",
  USER_BULK_IMPORT: "社員一括登録",
  TOOL_CREATE: "工具登録",
  TOOL_UPDATE: "工具更新",
  TOOL_DELETE: "工具削除",
  TOOL_REPLACE: "工具交換",
  TOOL_BULK_IMPORT: "工具一括登録",
  ADMIN_INVITE: "管理者招待",
  ADMIN_DELETE: "管理者削除",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    load();
  }, [actionFilter]);

  const load = async () => {
    const query = actionFilter ? `?action=${actionFilter}` : "";
    const response = await fetch(`/api/admin/audit-log${query}`);
    const data = await response.json();

    if (response.ok) {
      setLogs(data);
    }
  };

  return (
    <main className="container-app max-w-5xl py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">操作ログ</h1>
          <p className="page-desc">
            貸出・返却や、社員・工具・管理者に対する操作の記録です。
          </p>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="select"
          aria-label="操作の種類で絞り込む"
        >
          <option value="">すべての操作</option>
          {Object.entries(ACTION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table className="table-app">
          <thead>
            <tr>
              <th>日時</th>
              <th>実行者</th>
              <th>操作</th>
              <th>詳細</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="text-muted whitespace-nowrap tabular-nums">
                  {new Date(log.createdAt).toLocaleString("ja-JP")}
                </td>
                <td className="whitespace-nowrap">
                  <span className="font-bold">{log.actorName}</span>
                  <span className="badge badge-muted ml-2">
                    {log.actorType === "ADMIN" ? "管理者" : "社員"}
                  </span>
                </td>
                <td className="whitespace-nowrap">
                  {ACTION_LABELS[log.action] ?? log.action}
                </td>
                <td className="text-muted text-xs">
                  {log.detail && (
                    <pre className="font-sans whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(log.detail), null, 0)}
                    </pre>
                  )}
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted py-10 text-center">
                  ログがありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
