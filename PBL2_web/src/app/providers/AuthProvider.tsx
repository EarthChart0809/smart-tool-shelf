"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface LoginUser {
  id: number;
  employeeId: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: LoginUser | null;
  login: (user: LoginUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

// 何も操作がない状態が続いたら自動ログアウトするまでの時間 (ミリ秒)
const AUTO_LOGOUT_MS = 60 * 1000; // 1分。共有端末なので短めに設定

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginUser | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 起動時にログイン情報を復元
  useEffect(() => {
    const saved = localStorage.getItem("login-user");

    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const login = (user: LoginUser) => {
    setUser(user);

    localStorage.setItem("login-user", JSON.stringify(user));
  };

  const logout = useCallback(() => {
    setUser(null);

    localStorage.removeItem("login-user");
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      logout();
    }, AUTO_LOGOUT_MS);
  }, [logout]);

  // 未ログインなら何もしない。ログイン中はタイマーを張り、
  // クリックやキー入力などがあるたびにリセットする (共有端末の自動ログアウト)
  useEffect(() => {
    if (!user) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    resetTimer();

    const events = ["click", "keydown", "touchstart", "mousemove"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [user, resetTimer]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
