// src\app\layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopScraper - 商品管理システム",
  description: "オンラインショップの商品情報を効率的に管理するシステム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="light">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
        </div>
      </body>
    </html>
  );
}