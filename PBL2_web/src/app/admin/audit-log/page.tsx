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
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">操作ログ</h1>

      <div className="mb-4">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        >
          <option value="">すべての操作</option>
          {Object.entries(ACTION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">日時</th>
              <th className="p-3">実行者</th>
              <th className="p-3">操作</th>
              <th className="p-3">詳細</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-3 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("ja-JP")}
                </td>
                <td className="p-3">
                  {log.actorName}
                  <span className="ml-1 text-xs text-gray-400">
                    ({log.actorType === "ADMIN" ? "管理者" : "社員"})
                  </span>
                </td>
                <td className="p-3">
                  {ACTION_LABELS[log.action] ?? log.action}
                </td>
                <td className="p-3 text-xs text-gray-500">
                  {log.detail && (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(log.detail), null, 0)}
                    </pre>
                  )}
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
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