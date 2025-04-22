"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export default function TimestampTool() {
  const [mode, setMode] = useState<"text" | "timestamp">("text");
  const [textInput, setTextInput] = useState("");
  const [timestampInput, setTimestampInput] = useState("");

  const matchedDates = useMemo(() => {
    const regex = /\b(\d{4}[\/-]\d{2}[\/-]\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)?)\b/g;
    const matches = [...textInput.matchAll(regex)];

    return matches
      .map((m) => {
        const cleaned = m[1].replace(/\//g, "-");
        const parsed = new Date(cleaned);
        return isNaN(parsed.getTime()) ? null : { raw: m[1], date: parsed };
      })
      .filter(Boolean) as { raw: string; date: Date }[];
  }, [textInput]);

  const parsedTimestamps = useMemo(() => {
    const numberRegex = /\b\d{10,13}\b/g;
    const matches = [...timestampInput.matchAll(numberRegex)];

    return matches
      .map((m) => {
        const str = m[0];
        const num = Number(str);
        let date: Date | null = null;

        if (str.length === 13) {
          date = new Date(num);
        } else if (str.length === 10) {
          date = new Date(num * 1000);
        }

        return date && !isNaN(date.getTime()) ? { raw: str, date } : null;
      })
      .filter(Boolean) as { raw: string; date: Date }[];
  }, [timestampInput]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">时间戳转换工具</h1>
      <div className="flex justify-center mb-6">
        <Button
          variant={mode === "text" ? "default" : "outline"}
          className="mr-2"
          onClick={() => setMode("text")}
        >
          日期文本 ➜ 时间戳
        </Button>
        <Button
          variant={mode === "timestamp" ? "default" : "outline"}
          onClick={() => setMode("timestamp")}
        >
          时间戳数字 ➜ 日期
        </Button>
      </div>

      {mode === "text" && (
        <>
          <Input
            placeholder="请输入包含日期的文本，例如：2025-04-17 或 2025/04/17 12:00:00"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="mb-6"
          />
          {matchedDates.length === 0 ? (
            <p className="text-gray-400 text-center">未检测到可识别的日期格式</p>
          ) : (
            <div className="space-y-4">
              {matchedDates.map((item, idx) => {
                const millis = item.date.getTime().toString();
                const seconds = Math.floor(item.date.getTime() / 1000).toString();
                const formatted = format(item.date, "yyyy-MM-dd HH:mm:ss.SSS");

                return (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <p className="font-medium text-lg mb-2">原始时间：{item.raw}</p>
                      <p className="text-sm text-gray-600">格式化时间：{formatted}</p>
                      <p className="text-sm text-gray-600">毫秒时间戳：{millis}</p>
                      <p className="text-sm text-gray-600">秒级时间戳：{seconds}</p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(formatted)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          复制格式化时间
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(millis)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          复制毫秒时间戳
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(seconds)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          复制秒级时间戳
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {mode === "timestamp" && (
        <>
          <Input
            placeholder="请输入时间戳（10位秒，或13位毫秒），支持混合文本"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            className="mb-6"
          />
          {parsedTimestamps.length === 0 ? (
            <p className="text-gray-400 text-center">未检测到时间戳数字</p>
          ) : (
            <div className="space-y-4">
              {parsedTimestamps.map((item, idx) => {
                const formatted = format(item.date, "yyyy-MM-dd HH:mm:ss.SSS");
                const iso = item.date.toISOString();
                return (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <p className="font-medium text-lg mb-2">原始时间戳：{item.raw}</p>
                      <p className="text-sm text-gray-600">格式化时间：{formatted}</p>
                      <p className="text-sm text-gray-600">ISO 时间：{iso}</p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(formatted)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          复制格式化时间
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(iso)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          复制 ISO 时间
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
