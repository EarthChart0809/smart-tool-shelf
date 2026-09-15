import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/_components/Header";
import { AuthProvider } from "@/app/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Smart Tool Shelf",
  description: "工具の貸出・返却と在庫をリモートで管理するスマートツール棚システム。",
};

type Props = {
  children: React.ReactNode;
};

const RootLayout: React.FC<Props> = (props) => {
  const { children } = props;
  return (
    <html lang="ja">
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
