"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";

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
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">社員一覧</h1>
          <p className="mt-2 text-sm text-muted">
            登録済みの社員とログイン用QRコードです。
          </p>
        </div>
        <Link href="/admin/users/new" className="btn btn-primary flex-none">
          ＋ 社員を登録
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div key={user.id} className="card card-hover card-pad text-center">
            <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
            <p className="mt-0.5 text-sm text-muted">{user.employeeId}</p>

            {qrCodes[user.id] && (
              <div className="mt-4 flex justify-center">
                <img
                  src={qrCodes[user.id]}
                  alt={`${user.name} のQRコード`}
                  className="h-40 w-40 rounded-lg border border-line"
                />
              </div>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <div className="card card-pad col-span-full text-center text-muted">
            社員が登録されていません。
          </div>
        )}
      </div>
    </main>
  );
}
