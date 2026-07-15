"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useRef } from "react";

interface QRScannerProps {
  onRead: (employeeId: string) => void;
}

export default function QRScanner({ onRead }: QRScannerProps) {
  const scanned = useRef(false);

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow">
      <Scanner
        constraints={{
          facingMode: "environment",
        }}
        onScan={(result) => {
          if (scanned.current) return;

          if (result.length === 0) return;

          scanned.current = true;

          onRead(result[0].rawValue);
        }}
        onError={(error) => {
          console.error(error);
        }}
      />
    </div>
  );
}
