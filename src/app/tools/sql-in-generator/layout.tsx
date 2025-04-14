import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQL IN 语句生成器",
  description: "将多行文本转换为 SQL 的 IN 子句格式",
};

export default function SqlInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
