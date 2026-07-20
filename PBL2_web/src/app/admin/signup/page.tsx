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
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-8 text-3xl font-bold">管理者アカウント作成</h1>

      <div className="space-y-5">
        <input
          className="w-full rounded border p-3"
          placeholder="表示名(ヘッダーに表示されます)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full rounded border p-3"
          placeholder="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded border p-3"
          placeholder="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-600">{error}</p>}
        {message && <p className="text-green-700">{message}</p>}

        <button
          onClick={handleSignup}
          className="w-full rounded bg-green-700 py-3 text-white"
        >
          確認メールを送信する
        </button>
      </div>
    </main>
  );
}
