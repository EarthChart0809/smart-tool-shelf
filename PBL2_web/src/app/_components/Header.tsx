"use client";

import Link from "next/link";
import { useAuth } from "../providers/AuthProvider";
import BrandMark from "./BrandMark";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="container-app flex h-16 max-w-5xl items-center justify-between">
        {/* ロゴ + ナビ */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5">
            <span style={{ color: "var(--brand)" }}>
              <BrandMark size={26} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              Smart Tool Shelf
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/history"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-black/5 hover:text-foreground"
            >
              貸出履歴
            </Link>
            <Link
              href="/admin/login"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-black/5 hover:text-foreground"
            >
              管理者画面
            </Link>
          </nav>
        </div>

        {/* ユーザー状態 */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm font-medium text-foreground sm:flex">
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white"
                style={{ background: "var(--brand)" }}
              >
                {user.name?.charAt(0) ?? "?"}
              </span>
              {user.name}
            </span>
            <button onClick={logout} className="btn btn-outline btn-sm">
              ログアウト
            </button>
          </div>
        ) : (
          <Link href="/qr" className="btn btn-primary btn-sm">
            ログイン
          </Link>
        )}
      </div>
    </header>
  );
}
