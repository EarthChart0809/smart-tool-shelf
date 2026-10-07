"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import QrBulkDownload from "@/app/admin/_components/QrBulkDownload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faUserPlus } from "@fortawesome/free-solid-svg-icons";

interface User {
  id: number;
  employeeId: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const response = await fetch("/api/users");
    const data = await response.json();

    setUsers(data);

    const qrMap: Record<number, string> = {};

    for (const user of data) {
      qrMap[user.id] = await QRCode.toDataURL(user.employeeId);
    }

    setQrCodes(qrMap);
  };

  return (
    <main className="container-app max-w-5xl py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">社員管理</h1>
          <p className="page-desc">登録済みの社員とログイン用QRコードです。</p>
        </div>
        <Link href="/admin/users/new" className="btn btn-primary">
          <FontAwesomeIcon icon={faUserPlus} />
          社員を登録
        </Link>
      </div>

      <section className="panel mt-6">
        <div className="panel-head">
          <h2 className="section-title">QRコードの一括出力</h2>
        </div>
        <div className="panel-body flex flex-wrap items-start gap-3">
          <QrBulkDownload users={users} />
          <Link href="/admin/users/print" className="btn btn-outline btn-sm">
            <FontAwesomeIcon icon={faPrint} />
            印刷用ページを開く
          </Link>
        </div>
      </section>

      <h2 className="section-title mt-8 mb-3">
        社員一覧
        <span className="count">{users.length}</span>
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div key={user.id} className="card card-pad text-center">
            <p className="font-bold">{user.name}</p>
            <p className="text-muted text-xs">{user.employeeId}</p>

            {qrCodes[user.id] && (
              <div className="mt-3 flex justify-center">
                <img
                  src={qrCodes[user.id]}
                  alt={`${user.name} のQRコード`}
                  className="h-36 w-36"
                />
              </div>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <div className="card card-pad text-muted col-span-full text-center">
            社員が登録されていません。
          </div>
        )}
      </div>
    </main>
  );
}
