"use client";

import Link from "next/link";
import { useAuth } from "../providers/AuthProvider";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-blue-700 p-5 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold">
            Smart Tool Shelf
          </Link>

          <nav className="flex gap-4 text-sm">
            <Link href="/history">貸出履歴</Link>
            <Link href="/admin/users">社員管理</Link>
          </nav>
        </div>

        {user ? (
          <div className="flex gap-4">
            <p>👤 {user.name}</p>

            <button onClick={logout}>ログアウト</button>
          </div>
        ) : (
          <Link href="/qr">👤 未ログイン (ログインする)</Link>
        )}
      </div>
    </header>
  );
}
