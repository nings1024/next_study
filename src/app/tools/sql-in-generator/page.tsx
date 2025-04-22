"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner"; // 使用 shadcn/ui 的通知系统

export default function SqlInGeneratorPage() {
  const [input, setInput] = useState("");

  const parsedItems = input
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const sqlInStatement = parsedItems.length
    ? `IN (${parsedItems.map((item) => `'${item}'`).join(", ")})`
    : "";

  const handleCopy = () => {
    if (!sqlInStatement) return;
    navigator.clipboard.writeText(sqlInStatement);
    toast.success("复制成功");
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">SQL IN 语句生成器</h1>
      <p className="text-gray-500 mb-6">将每行数据转换为 SQL 的 IN 子句格式</p>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入每行一个值，例如：\napple\nbanana\ncarrot"
        className="mb-4 h-40"
      />

      <Card className="mb-4">
        <CardContent className="p-4 flex items-start justify-between gap-4">
          <pre className="whitespace-pre-wrap break-words text-sm text-gray-800 flex-1">
            {sqlInStatement || "IN (...)"}
          </pre>
          <Button variant="outline" size="icon" onClick={handleCopy}>
            <Copy className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
