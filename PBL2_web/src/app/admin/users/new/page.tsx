"use client";

import { useState } from "react";
import CsvUploader from "@/app/admin/_components/CsvUploader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";

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
    <main className="container-app max-w-3xl py-8">
      <h1 className="page-title">社員登録</h1>
      <p className="page-desc">
        新しい社員を登録します。登録後、社員一覧からQRコードを発行できます。
      </p>

      <section className="panel mt-6 mb-5">
        <div className="panel-head">
          <h2 className="section-title">社員を登録</h2>
        </div>
        <div className="panel-body grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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

          <button onClick={register} className="btn btn-primary">
            <FontAwesomeIcon icon={faUserPlus} />
            登録する
          </button>
        </div>
      </section>

      <CsvUploader
        importEndpoint="/api/admin/users/bulk"
        exportEndpoint="/api/admin/users/export"
        templateHeaders={["employeeId", "name"]}
        templateFileName="社員一括登録テンプレート.csv"
        description="1行目をヘッダー行(employeeId, name)にしてください。既に登録済みの社員番号はスキップされます。"
        onComplete={() => {
          alert("一括登録が完了しました。");
        }}
      />
    </main>
  );
}
