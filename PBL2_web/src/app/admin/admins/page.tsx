"use client";

import { useEffect, useState } from "react";

interface Admin {
  id: string;
  name: string;
  email: string;
  passwordSet: boolean;
  createdAt: string;
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const response = await fetch("/api/admin/admins");
    const data = await response.json().catch(() => ({
      success: false,
      message: "サーバーエラーが発生しました。",
    }));

    if (!response.ok || !data.success) {
      alert(data.message ?? "削除に失敗しました。");
      return;
    }

    setAdmins(data.admins);
  };

  const handleInvite = async () => {
    setError("");
    setMessage("");

    const response = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: "サーバーエラーが発生しました。",
    }));

    if (!response.ok || !data.success) {
      setError(data.message ?? "招待に失敗しました。");
      return;
    }

    setMessage(`${email} に招待メールを送信しました。`);
    setName("");
    setEmail("");
    await load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} さんを管理者から削除しますか？`)) return;

    const response = await fetch(`/api/admin/admins/${id}`, {
      method: "DELETE",
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: "サーバーエラーが発生しました。",
    }));

    if (!response.ok || !data.success) {
      alert(data.message ?? "削除に失敗しました。");
      return;
    }

    await load();
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">管理者管理</h1>

      <div className="mb-8 space-y-3 rounded-lg border bg-white p-5 shadow">
        <h2 className="font-bold">新しい管理者を招待</h2>

        <input
          className="w-full rounded border p-2"
          placeholder="氏名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <button
          onClick={handleInvite}
          className="rounded bg-blue-700 px-4 py-2 text-white"
        >
          招待メールを送信
        </button>
      </div>

      <div className="space-y-2">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="flex items-center justify-between rounded-lg border bg-white p-4 shadow"
          >
            <div>
              <p className="font-bold">{admin.name}</p>
              <p className="text-sm text-gray-500">{admin.email}</p>
              {!admin.passwordSet && (
                <p className="text-xs text-orange-600">
                  招待中(パスワード未設定)
                </p>
              )}
            </div>

            <button
              onClick={() => handleDelete(admin.id, admin.name)}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white"
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
