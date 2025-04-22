"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function SlashConverter() {
  const [input, setInput] = useState("");
  const [copiedType, setCopiedType] = useState<"double" | "back" | null>(null);

  const doubleSlash = input.replace(/\\/g, "\\\\");
  const backSlash = input.replace(/\\/g, "/");

  const handleCopy = async (text: string, type: "double" | "back") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      toast.success("复制成功");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">斜杠转换工具</h1>

      <Input
        placeholder="请输入字符串，例如：https://example.com/path"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="mb-6"
      />

      <Card className="mb-4">
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <p className="font-medium">双正斜杠：</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(doubleSlash, "double")}
            >
              {copiedType === "double" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <code className="whitespace-pre-wrap break-all text-sm bg-muted p-2 rounded">
            {doubleSlash}
          </code>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <p className="font-medium">反斜杠：</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(backSlash, "back")}
            >
              {copiedType === "back" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <code className="whitespace-pre-wrap break-all text-sm bg-muted p-2 rounded">
            {backSlash}
          </code>
        </CardContent>
      </Card>
    </main>
  );
}
