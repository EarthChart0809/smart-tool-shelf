"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faQrcode } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

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
    <main className="container-app max-w-md py-8 text-center">
      <div className="back-link mb-6 text-left">
        <Link
          href="/"
          className="text-muted hover:text-foreground inline-flex items-center gap-2 text-sm"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          トップへ戻る
        </Link>
      </div>

      <div>
        <h1 className="page-title">QRコードでログイン</h1>
        <p className="page-desc">
          社員QRコードをカメラの枠内にかざしてください。
        </p>
      </div>

      {/* カメラ（読み取り中はスキャンラインが動く） */}
      <div className="scanner-frame mt-7">
        <div className="scanner-view">
          <QRScanner onRead={loginUser} />
          {!loading && <span className="scanner-line" />}
        </div>
        <p className="flex items-center justify-center gap-2 pt-2.5 pb-1 text-xs font-bold text-white/75">
          {loading ? (
            <>
              <span className="spinner" />
              ログインしています…
            </>
          ) : (
            <>
              <span className="live-dot" />
              読み取り中
            </>
          )}
        </p>
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 text-sm font-bold">
        <FontAwesomeIcon icon={faQrcode} className="text-[var(--brand)]" />
        QRコードを枠の中央に合わせてください
      </p>
      <p className="text-muted mt-1 text-xs">
        カメラが起動しない場合は、ブラウザのカメラの使用を許可してください。
      </p>
      <a href="/qr" className="text-link mt-4 inline-block">
        読み取れないときは、ここを押してやり直す
      </a>
    </main>
  );
}
