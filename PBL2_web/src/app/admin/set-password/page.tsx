"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    const establishSession = async () => {
      // 無料プランではメールテンプレートを編集できないため、Supabaseの
      // デフォルト招待テンプレートが使われる。その場合トークンは
      // URLの #access_token=...&refresh_token=... という形式(フラグメント)
      // で渡ってくるので、ブラウザ側でそれを読み取ってセッションを確立する。
      const hash = window.location.hash;

      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) {
            setError("招待リンクが無効か、期限切れです。");
            return;
          }

          // トークンをURL・ブラウザ履歴に残さないよう消しておく
          window.history.replaceState(null, "", window.location.pathname);
          setReady(true);
          return;
        }
      }

      // ハッシュが無い場合(既にセッション確立済みで再訪問した場合など)
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setReady(true);
      } else {
        setError("招待リンクが無効です。管理者に再招待を依頼してください。");
      }
    };

    establishSession();
  }, []);

  const handleSubmit = async () => {
    setError("");

    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください。");
      return;
    }

    if (password !== confirm) {
      setError("パスワードが一致しません。");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await fetch("/api/admin/set-password-complete", { method: "POST" });

    router.push("/admin/dashboard");
    router.refresh();
  };

  if (error) {
    return (
      <main className="mx-auto max-w-md p-8 text-center text-red-600">
        {error}
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="mx-auto max-w-md p-8 text-center text-gray-500">
        確認中...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-2 text-3xl font-bold">パスワード設定</h1>
      <p className="mb-8 text-sm text-gray-500">
        管理者として招待されました。ログインに使うパスワードを設定してください。
      </p>

      <div className="space-y-5">
        <input
          className="w-full rounded border p-3"
          placeholder="新しいパスワード(8文字以上)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="w-full rounded border p-3"
          placeholder="パスワード(確認)"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full rounded bg-blue-700 py-3 text-white"
        >
          設定して開始する
        </button>
      </div>
    </main>
  );
}
