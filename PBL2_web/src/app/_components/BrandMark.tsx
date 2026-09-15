/**
 * BrandMark — HOGETSU の三日月（クレセント）を想起させるロゴマーク。
 * ヘッダーやログイン画面のアクセントに使う純粋な装飾コンポーネント。
 * 機能ロジックは持たない。色は currentColor を継承する。
 */
type Props = {
  size?: number;
  className?: string;
};

export default function BrandMark({ size = 28, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Smart Tool Shelf"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 外側の満月から内側をくり抜いて三日月を作る */}
      <path
        d="M50 4a46 46 0 1 0 0 92 46 46 0 0 1 0-92z"
        fill="currentColor"
      />
    </svg>
  );
}
