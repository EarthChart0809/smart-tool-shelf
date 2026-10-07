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

  // トップページ（ログイン前）にもこのまま埋め込んで使う
  return (
    <section className="container-app max-w-md py-2 text-center">
      <div className="card overflow-hidden p-1.5">
        <div className="overflow-hidden rounded-[var(--radius-sm)]">
          <QRScanner onRead={loginUser} />
        </div>
      </div>

      {loading ? (
        <p className="text-muted mt-4 flex items-center justify-center gap-2 text-sm">
          <span className="spinner" />
          ログインしています…
        </p>
      ) : (
        <>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold">
            <FontAwesomeIcon icon={faQrcode} className="text-brand" />
            社員QRコードをカメラにかざしてください
          </p>
          <p className="text-muted mt-1 text-xs">
            カメラが起動しない場合は、ブラウザのカメラの使用を許可してください。
          </p>
        </>
      )}
    </section>
  );
}
