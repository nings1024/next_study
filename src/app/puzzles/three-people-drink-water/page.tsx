// src/app/puzzles/three-people-drink-water/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function PuzzlePage() {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">逻辑题：三人喝水问题</h1>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-4">
          <p>
            有三个人依次进入房间喝水。每个人进入房间时，房间里的水壶里都装满了水，但没有杯子。
          </p>
          <p>
            他们每个人只能进入房间一次，且不能与其他人交流。他们都成功喝到了水。
          </p>
          <p className="font-semibold">问题：他们是怎么做到的？</p>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={() => setShowAnswer((prev) => !prev)}>
          {showAnswer ? "隐藏答案" : "查看答案"}
        </Button>
      </div>

      {showAnswer && (
        <Card className="mt-6 bg-green-50">
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xl font-semibold">答案解析</h2>
            <p>
              房间里虽然没有杯子，但每个人都是直接用水壶口喝的水。水壶里装满水，因此每个人看到水壶都是满的。
            </p>
            <p>
              第一个人喝完之后重新把水壶接满放回，第二个人照样操作，第三个人也是一样。
            </p>
            <p className="text-gray-500 italic">这个题目的趣味在于跳出“必须用杯子喝水”的惯性思维。</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
