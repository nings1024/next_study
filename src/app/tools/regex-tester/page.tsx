"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReactNode } from 'react';


export default function RegexTester() {
  const [regex, setRegex] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [isValidRegex, setIsValidRegex] = useState<boolean>(true);

  // 使用useMemo来缓存高亮结果
  const highlightedText = useMemo(() => {
    if (!regex || !text) return text;

    try {
      const regexObj = new RegExp(regex, "g");
      const parts: (string | ReactNode)[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regexObj.exec(text)) !== null) {
        // 添加未匹配的部分
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }

        // 添加匹配的部分（高亮）
        parts.push(
          <span key={match.index} className="bg-yellow-300 text-black">
            {match[0]}
          </span>
        );

        lastIndex = match.index + match[0].length;

        // 避免无限循环
        if (match.index === regexObj.lastIndex) {
          regexObj.lastIndex++;
        }
      }

      // 添加剩余文本
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts.length > 0 ? parts : text;
    } catch  {
      return text;
    }
  }, [regex, text]);

  const handleRegexChange = (value: string) => {
    setRegex(value);
    // 验证正则表达式
    if (value) {
      try {
        new RegExp(value);
        setIsValidRegex(true);
      } catch {
        setIsValidRegex(false);
      }
    } else {
      setIsValidValid(true);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">正则测试工具</h1>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-4">
          <Label htmlFor="regex-input" className="text-lg font-medium">
            正则表达式
          </Label>
          <Input
            id="regex-input"
            placeholder="例如: \d+ 或 [A-Za-z]+"
            value={regex}
            onChange={(e) => handleRegexChange(e.target.value)}
            className={!isValidRegex && regex ? "border-red-500" : ""}
          />
          {!isValidRegex && regex && (
            <p className="text-red-500 text-sm">无效的正则表达式</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Label className="text-lg font-medium">测试文本（匹配部分自动高亮）</Label>

          {/* 两层容器 */}
          <div className="relative text-sm font-mono leading-[1.5]">
            {/* 高亮背景层 */}
            <pre
              className="absolute inset-0 m-0 p-3 pointer-events-none whitespace-pre-wrap break-words overflow-auto"
              aria-hidden
            >
              <code>{highlightedText}</code>
            </pre>

            {/* 真正的输入层 */}
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请输入要测试的文本"
              className="relative z-10 w-full h-[200px] resize-y p-3 font-mono leading-[1.5] text-transparent caret-black bg-transparent focus:outline-none"
              style={{ color: 'transparent' }} // 把文字隐藏掉，只留光标
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}