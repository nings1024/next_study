// src/app/page.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input"; // 假设你用的是 shadcn/ui
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

type Tool = {
  name: string;
  description: string;
  href: string;
  type?: "tool" | "puzzle";
};

const tools: Tool[] = [
  { name: "SQL IN 语句生成器", description: "将每行数据转换为 SQL 的 IN 子句格式", href: "/tools/sql-in-generator", type: "tool" },
  { name: "进制转换", description: "进制转换", href: "/tools/base-converter", type: "tool" },
  { name: "斜杠转换", description: "斜杠转换", href: "/tools/slash-converter", type: "tool" },
  { name: "时间戳转换", description: "时间戳转换", href: "/tools/timestamp-extractor", type: "tool" },
  { name: "正则测试", description: "在线测试正则表达式", href: "/tools/regex-tester", type: "tool" },
];


export default function Home() {
  const [query, setQuery] = useState("");

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(query.toLowerCase()) ||
    tool.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-center">工具导航</h1>
      <p className="text-gray-500 text-center mb-6">快速访问开发常用工具</p>

      <div className="mb-8">
        <Input
          placeholder="搜索工具..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md mx-auto"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredTools.map((tool, index) => (
          <motion.a
            key={tool.href}
            href={tool.href}
            target="_blank"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="block"
          >
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-1">{tool.name}</h2>
                <p className="text-sm text-gray-500">{tool.description}</p>
              </CardContent>
            </Card>
          </motion.a>
        ))}
        {filteredTools.length === 0 && (
          <div className="text-center col-span-full text-gray-500">没有找到相关工具</div>
        )}
      </div>
    </main>
  );
}
