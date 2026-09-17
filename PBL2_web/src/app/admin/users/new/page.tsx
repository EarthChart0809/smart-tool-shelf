"use client";

import { useState } from "react";

export default function NewUserPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");

  const register = async () => {
    await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId,
        name,
      }),
    });

    alert("登録しました");

    setEmployeeId("");
    setName("");
  };

  return (
    <main className="container-app max-w-md py-14">
      <div className="card card-pad">
        <h1 className="page-title text-center">社員登録</h1>
        <p className="mt-2 mb-8 text-center text-sm text-muted">
          新しい社員を登録します。登録後、一覧からQRコードを発行できます。
        </p>

        <div className="space-y-4">
          <div>
            <label className="label">社員番号</label>
            <input
              className="input"
              placeholder="例：E-1024"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>

          <div>
            <label className="label">氏名</label>
            <input
              className="input"
              placeholder="例：山田 太郎"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button onClick={register} className="btn btn-primary w-full">
            登録する
          </button>
        </div>
      </div>
    </main>
  );
}
