import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import Header from "@/app/_components/Header";
import { AuthProvider } from "@/app/providers/AuthProvider";

// アイコン(Font Awesome)のCSSは上で読み込むので、自動挿入は止める（表示のちらつき防止）
config.autoAddCss = false;

// 抱月工業のコーポレートサイトと同じ書体（Noto Sans JP）
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Smart Tool Shelf",
  description:
    "工具の貸出・返却と在庫をリモートで管理するスマートツール棚システム。",
};

type Props = {
  children: React.ReactNode;
};

const RootLayout: React.FC<Props> = (props) => {
  const { children } = props;
  return (
    <html lang="ja" className={notoSansJp.variable}>
      <body>
        <AuthProvider>
          <Header />
          <div>{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
