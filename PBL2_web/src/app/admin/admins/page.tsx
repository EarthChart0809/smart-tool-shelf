"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faTrashCan } from "@fortawesome/free-solid-svg-icons";

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
    <main className="container-app max-w-3xl py-8">
      <h1 className="page-title">管理者管理</h1>
      <p className="page-desc">
        管理画面にログインできる管理者を招待・削除できます。
      </p>

      <section className="panel mt-6">
        <div className="panel-head">
          <h2 className="section-title">新しい管理者を招待</h2>
        </div>
        <div className="panel-body space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">氏名</label>
              <input
                className="input"
                placeholder="例：山田 太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">メールアドレス</label>
              <input
                className="input"
                placeholder="admin@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="banner banner-error">{error}</p>}
          {message && <p className="banner banner-ok">{message}</p>}

          <button onClick={handleInvite} className="btn btn-primary">
            <FontAwesomeIcon icon={faEnvelope} />
            招待メールを送信
          </button>
        </div>
      </section>

      <section className="panel mt-5">
        <div className="panel-head">
          <h2 className="section-title">
            管理者一覧
            <span className="count">{admins.length}</span>
          </h2>
        </div>

        {admins.map((admin) => (
          <div
            key={admin.id}
            className="panel-row flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-bold">
                {admin.name}
                {!admin.passwordSet && (
                  <span className="badge badge-warn">
                    招待中(パスワード未設定)
                  </span>
                )}
              </p>
              <p className="text-muted truncate text-xs">{admin.email}</p>
            </div>

            <button
              onClick={() => handleDelete(admin.id, admin.name)}
              className="btn btn-danger btn-sm flex-none"
            >
              <FontAwesomeIcon icon={faTrashCan} />
              削除
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
