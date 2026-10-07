"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";

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
    <main className="container-app max-w-md py-10 text-center">
      <div className="icon-tile mx-auto mb-4">
        <FontAwesomeIcon icon={faQrcode} />
      </div>
      <h1 className="page-title">QRコードでログイン</h1>
      <p className="page-desc">
        社員QRコードをカメラの枠内にかざしてください。
      </p>

      <div className="card mt-6 overflow-hidden p-1.5">
        <div className="overflow-hidden rounded-[var(--radius-sm)]">
          <QRScanner onRead={loginUser} />
        </div>
      </div>

      {loading ? (
        <p className="text-muted mt-5 flex items-center justify-center gap-2 text-sm">
          <span className="spinner" />
          ログインしています…
        </p>
      ) : (
        <p className="text-muted mt-4 text-xs">
          カメラが起動しない場合は、ブラウザのカメラの使用を許可してください。
        </p>
      )}
    </main>
  );
}
