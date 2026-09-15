"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminSignupPage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // 表示名は Supabase Auth の user_metadata に持たせる
        data: {
          name,
        },
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      "確認メールを送信しました。メール内のリンクをクリックして有効化してください。",
    );
  };

  return (
    <main className="container-app max-w-md py-14">
      <div className="card card-pad">
        <h1 className="page-title text-center">管理者アカウント作成</h1>
        <p className="mt-2 mb-8 text-center text-sm text-muted">
          新しく管理者を登録します。
        </p>

        <div className="space-y-4">
          <div>
            <label className="label">表示名</label>
            <input
              className="input"
              placeholder="ヘッダーに表示されます"
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

          <div>
            <label className="label">パスワード</label>
            <input
              className="input"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="banner banner-info text-sm" style={{ fontWeight: 500 }}>
              {error}
            </p>
          )}
          {message && (
            <p
              className="banner text-sm"
              style={{
                fontWeight: 500,
                background: "var(--ok-soft)",
                color: "var(--ok)",
                borderColor: "#bfe6cd",
              }}
            >
              {message}
            </p>
          )}

          <button onClick={handleSignup} className="btn btn-primary w-full">
            確認メールを送信する
          </button>
        </div>
      </div>
    </main>
  );
}
