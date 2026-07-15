"use client";

import { useEffect, useState } from "react";
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
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-3xl font-bold">社員一覧</h1>

      <div className="grid grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="rounded-lg border p-5 shadow">
            <h2 className="text-xl font-bold">{user.name}</h2>

            <p>{user.employeeId}</p>

            {qrCodes[user.id] && (
              <img src={qrCodes[user.id]} alt="QR" className="mt-4" />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
