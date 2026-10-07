"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

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

  const handleResetRequest = async () => {
    setError("");
    setResetMessage("");

    if (!email) {
      setError(
        "パスワードリセットには、まずメールアドレスを入力してください。",
      );
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/set-password`,
    });

    // メールの存在有無を外部から判別できないよう、成功時と同じ文言にする
    if (error) {
      console.error(error);
    }

    setResetMessage(
      "そのメールアドレスが登録されていれば、パスワード再設定用のメールを送信しました。",
    );
  };

  return (
    <main className="container-app max-w-md py-12">
      <div className="card p-8">
        <div className="text-center">
          <Image
            src="/crescent.svg"
            alt=""
            width={36}
            height={36}
            className="mx-auto mb-3"
          />
          <h1 className="page-title">管理者ログイン</h1>
          <p className="page-desc">
            管理機能を利用するにはログインしてください。
          </p>
        </div>

        <div className="mt-7 space-y-4">
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

          {error && <p className="banner banner-error">{error}</p>}
          {resetMessage && <p className="banner banner-ok">{resetMessage}</p>}

          <button onClick={handleLogin} className="btn btn-primary w-full">
            ログイン
          </button>

          <div className="text-center">
            <button onClick={handleResetRequest} className="text-link">
              パスワードを忘れた場合
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
