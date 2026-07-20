"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("メールアドレスまたはパスワードが違います。");
      return;
    }

    router.push("/admin/users");
    router.refresh();
  };

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-8 text-3xl font-bold">管理者ログイン</h1>

      <div className="space-y-5">
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

        <button
          onClick={handleLogin}
          className="w-full rounded bg-blue-700 py-3 text-white"
        >
          ログイン
        </button>
      </div>
    </main>
  );
}
