"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";

interface User {
  id: number;
  employeeId: string;
  name: string;
}

export default function QrPrintPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [qrMap, setQrMap] = useState<Record<number, string>>({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const response = await fetch("/api/users");
    const data: User[] = await response.json();

    setUsers(data);

    const map: Record<number, string> = {};

    for (const user of data) {
      map[user.id] = await QRCode.toDataURL(user.employeeId, {
        width: 400,
        margin: 1,
      });
    }

    setQrMap(map);
  };

  return (
    <main className="p-6">
      <div className="mb-6 print:hidden">
        <h1 className="mb-2 text-2xl font-bold">QRコード印刷</h1>
        <p className="mb-3 text-sm text-gray-500">
          社員 {users.length}
          名分のQRカードです。ブラウザの印刷機能でA4に印刷してください。
        </p>

        <button
          onClick={() => window.print()}
          className="rounded bg-blue-700 px-4 py-2 text-sm text-white"
        >
          印刷する
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex break-inside-avoid flex-col items-center rounded-lg border p-4"
          >
            {qrMap[user.id] && (
              <Image
                src={qrMap[user.id]}
                alt={`${user.name}のQRコード`}
                width={140}
                height={140}
                unoptimized
              />
            )}

            <p className="mt-2 font-bold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.employeeId}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
