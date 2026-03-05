import type { Metadata } from "next";
import "./globals.css";

import GravityWrapper from "@/components/shared/GravityWrapper";

export const metadata: Metadata = {
  title: "Train | チームの成長を加速させるプラットフォーム",
  description: "チームの貢献を可視化し、スキルとポイントで成長を加速させるプロジェクト管理プラットフォーム。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <GravityWrapper>
          {children}
        </GravityWrapper>
      </body>
    </html>
  );
}
