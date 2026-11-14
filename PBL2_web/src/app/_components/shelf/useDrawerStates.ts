"use client";

import { useEffect, useState } from "react";

interface DrawerStatus {
  states: Record<number, boolean>;
  online: boolean;
  loaded: boolean;
}

export function useDrawerStates(intervalMs = 1500): DrawerStatus {
  const [status, setStatus] = useState<DrawerStatus>({
    states: {},
    online: false,
    loaded: false,
  });

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      // タブが裏に回っている間は通信しない(無駄なDBアクセスを避ける)
      if (document.hidden) return;

      try {
        const response = await fetch("/api/drawers", { cache: "no-store" });
        const data = await response.json();

        if (cancelled) return;

        const states: Record<number, boolean> = {};
        for (const drawer of data.drawers) {
          states[drawer.boxId] = drawer.isOpen;
        }

        setStatus({ states, online: data.online, loaded: true });
      } catch {
        if (!cancelled) {
          setStatus((prev) => ({ ...prev, online: false }));
        }
      }
    };

    poll();
    const timer = setInterval(poll, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [intervalMs]);

  return status;
}