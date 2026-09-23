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
    return <p className="p-6 text-gray-500">読み込み中...</p>;
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-3xl font-bold">アカウント設定</h1>

      <section className="mb-8 rounded-lg border bg-white p-5 shadow">
        <h2 className="mb-3 font-bold">プロフィール</h2>

        <div className="mb-4 text-sm text-gray-500">
          <p>メールアドレス: {profile.email}</p>
          <p>権限: {profile.role === "ADMIN" ? "管理者" : profile.role}</p>
          <p>
            登録日: {new Date(profile.createdAt).toLocaleDateString("ja-JP")}
          </p>
        </div>

        <label className="mb-1 block text-sm text-gray-500">表示名</label>
        <input
          className="mb-3 w-full rounded border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {nameError && <p className="mb-2 text-sm text-red-600">{nameError}</p>}
        {nameMessage && (
          <p className="mb-2 text-sm text-green-700">{nameMessage}</p>
        )}

        <button
          onClick={handleUpdateName}
          className="rounded bg-blue-700 px-4 py-2 text-sm text-white"
        >
          表示名を更新
        </button>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow">
        <h2 className="mb-3 font-bold">パスワード変更</h2>

        <div className="space-y-3">
          <input
            className="w-full rounded border p-2"
            placeholder="現在のパスワード"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <input
            className="w-full rounded border p-2"
            placeholder="新しいパスワード(8文字以上)"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            className="w-full rounded border p-2"
            placeholder="新しいパスワード(確認)"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {passwordError && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
          {passwordMessage && (
            <p className="text-sm text-green-700">{passwordMessage}</p>
          )}

          <button
            onClick={handleChangePassword}
            className="rounded bg-blue-700 px-4 py-2 text-sm text-white"
          >
            パスワードを変更
          </button>
        </div>
      </section>
    </main>
  );
}