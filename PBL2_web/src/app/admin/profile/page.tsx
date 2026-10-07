"use client";

import { useEffect, useState } from "react";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [nameMessage, setNameMessage] = useState("");
  const [nameError, setNameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const response = await fetch("/api/admin/profile");
    const data = await response.json();

    if (response.ok) {
      setProfile(data);
      setName(data.name);
    }
  };

  const handleUpdateName = async () => {
    setNameError("");
    setNameMessage("");

    const response = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await response.json();

    if (!data.success) {
      setNameError(data.message ?? "更新に失敗しました。");
      return;
    }

    setNameMessage("表示名を更新しました。");
    await load();
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordError("新しいパスワードが一致しません。");
      return;
    }

    const response = await fetch("/api/admin/profile/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!data.success) {
      setPasswordError(data.message ?? "変更に失敗しました。");
      return;
    }

    setPasswordMessage("パスワードを変更しました。");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (!profile) {
    return (
      <p className="text-muted flex items-center justify-center gap-2 py-24 text-sm">
        <span className="spinner" />
        読み込み中...
      </p>
    );
  }

  return (
    <main className="container-app max-w-3xl py-8">
      <h1 className="page-title">アカウント設定</h1>
      <p className="page-desc">表示名とパスワードを変更できます。</p>

      <section className="panel mt-6">
        <div className="panel-head">
          <h2 className="section-title">プロフィール</h2>
        </div>
        <div className="panel-body">
          <dl className="mb-5 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted text-xs">メールアドレス</dt>
              <dd className="break-all">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">権限</dt>
              <dd>{profile.role === "ADMIN" ? "管理者" : profile.role}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">登録日</dt>
              <dd>{new Date(profile.createdAt).toLocaleDateString("ja-JP")}</dd>
            </div>
          </dl>

          <label className="label">表示名</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              onClick={handleUpdateName}
              className="btn btn-primary flex-none"
            >
              表示名を更新
            </button>
          </div>

          {nameError && <p className="banner banner-error mt-3">{nameError}</p>}
          {nameMessage && (
            <p className="banner banner-ok mt-3">{nameMessage}</p>
          )}
        </div>
      </section>

      <section className="panel mt-5">
        <div className="panel-head">
          <h2 className="section-title">パスワード変更</h2>
        </div>
        <div className="panel-body space-y-3">
          <div>
            <label className="label">現在のパスワード</label>
            <input
              className="input"
              placeholder="現在のパスワード"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">新しいパスワード</label>
              <input
                className="input"
                placeholder="新しいパスワード(8文字以上)"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label">新しいパスワード(確認)</label>
              <input
                className="input"
                placeholder="新しいパスワード(確認)"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {passwordError && (
            <p className="banner banner-error">{passwordError}</p>
          )}
          {passwordMessage && (
            <p className="banner banner-ok">{passwordMessage}</p>
          )}

          <button onClick={handleChangePassword} className="btn btn-primary">
            パスワードを変更
          </button>
        </div>
      </section>
    </main>
  );
}
