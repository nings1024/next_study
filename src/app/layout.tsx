import type { Metadata } from "next";
import "./globals.css";
import Provider from "./_trpc/Provider";

import { Toaster } from "sonner";




export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 使用 Tailwind 定义的 font-sans / font-mono，已从 CSS 变量绑定 */}
      <body className="antialiased font-sans">
        <Provider>{children}<Toaster richColors position="top-center" /></Provider>
      </body>
    </html>
  );
}
