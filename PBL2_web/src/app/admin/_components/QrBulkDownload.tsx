"use client";

import { useState } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";

interface User {
  id: number;
  employeeId: string;
  name: string;
}

export default function QrBulkDownload({ users }: { users: User[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (users.length === 0) {
      setError("登録されている社員がいません。");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const zip = new JSZip();

      for (const user of users) {
        const dataUrl = await QRCode.toDataURL(user.employeeId, {
          width: 400,
          margin: 2,
        });

        // data:image/png;base64,xxxx の base64 部分だけを取り出して ZIP に入れる
        const base64 = dataUrl.split(",")[1];

        // ファイル名に使えない文字が混ざっても壊れないよう置換しておく
        const safeName = user.name.replace(/[\\/:*?"<>|]/g, "_");

        zip.file(`${user.employeeId}_${safeName}.png`, base64, {
          base64: true,
        });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "社員QRコード.zip";
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("QRコードの生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="rounded bg-green-700 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading
          ? "生成中..."
          : `QRコードを一括ダウンロード(${users.length}件)`}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
