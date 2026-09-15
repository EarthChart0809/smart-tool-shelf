"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import QRScanner from "../_components/QRScanner";
import { useAuth } from "../providers/AuthProvider";

export default function QRPage() {
  const router = useRouter();

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const loginUser = async (employeeId: string) => {
    if (loading) return;

    setLoading(true);

    const response = await fetch("/api/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        employeeId,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      alert("社員が見つかりません。");

      setLoading(false);

      return;
    }

    login(data.user);

    alert(`${data.user.name} さん、ようこそ`);

    router.push("/");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="container-app max-w-md py-12">
        <div className="text-center">
          <h1 className="page-title">QRコードでログイン</h1>
          <p className="mt-2 text-sm text-muted">
            社員QRコードをカメラの枠内にかざしてください。
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
          <QRScanner onRead={loginUser} />
        </div>

        {loading && (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
            <span
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line"
              style={{ borderTopColor: "var(--brand)" }}
            />
            ログインしています…
          </p>
        )}
      </div>
    </main>
  );
}
