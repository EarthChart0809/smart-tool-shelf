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
    <main className="mx-auto max-w-xl p-10">
      <h1 className="mb-6 text-center text-3xl font-bold">
        QRコードをかざしてください
      </h1>

      <QRScanner onRead={loginUser} />

      {loading && <p className="mt-6 text-center">ログイン中...</p>}
    </main>
  );
}
