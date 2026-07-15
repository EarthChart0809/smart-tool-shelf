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
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-8 text-3xl font-bold">社員登録</h1>

      <div className="space-y-5">
        <input
          className="w-full rounded border p-3"
          placeholder="社員番号"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <input
          className="w-full rounded border p-3"
          placeholder="氏名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={register}
          className="w-full rounded bg-green-700 py-3 text-white"
        >
          登録
        </button>
      </div>
    </main>
  );
}
