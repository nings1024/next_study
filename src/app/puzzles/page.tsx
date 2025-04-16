// src/app/puzzles/page.tsx
"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type Puzzle = {
  title: string;
  description: string;
  href: string;
  tags?: string[];
};

const puzzles: Puzzle[] = [
  {
    title: "尼姆游戏",
    description: "取石子游戏",
    href: "/puzzles/nim-game",
    tags: ["异或", "组合"],
  },
  {
    title: "数字谜题：二进制灯泡",
    description: "考验你对二进制数字的理解能力。",
    href: "/puzzles/binary-lights",
    tags: ["二进制", "数字逻辑"],
  },
  // 可以继续添加更多谜题
];

export default function PuzzleListPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">逻辑谜题集 🧠</h1>
      <p className="text-center text-gray-500 mb-6">挑战你的思维边界，从趣味中学习</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {puzzles.map((puzzle) => (
          <Link href={puzzle.href} key={puzzle.href}>
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-1">{puzzle.title}</h2>
                <p className="text-sm text-gray-500">{puzzle.description}</p>

                {puzzle.tags && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {puzzle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {puzzles.length === 0 && (
        <div className="text-center text-gray-500 mt-8">暂无谜题，敬请期待~</div>
      )}
    </main>
  );
}
