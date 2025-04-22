import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "时间戳转换",
  description: "时间戳转换",
};

export default function SqlInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
