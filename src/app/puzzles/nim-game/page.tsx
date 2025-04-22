// src/app/puzzles/nim-game/page.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NimGamePage() {
  const [piles, setPiles] = useState<string>(""); // 用户输入的堆数
  const [moveResult, setMoveResult] = useState<string>(""); // 用于展示最优取法
  const [isWinning] = useState<boolean | null>(null); // 用于判断能否获胜

  // 解析输入的堆数并计算
  const handleCalculateMove = () => {
    const pileArray = piles.trim().split(" ").map((num) => parseInt(num.trim(), 10));

    if (pileArray.some((num) => isNaN(num))) {
      setMoveResult("请输入有效的堆数，数字之间用空格分隔。");
      return;
    }

    const xorSum = pileArray.reduce((acc, pile) => acc ^ pile, 0);

    if (xorSum === 0) {
      setMoveResult("无法获胜，当前局面无论如何都不能获胜！");
    } else {
      // 找到最优策略
      for (let i = 0; i < pileArray.length; i++) {
        const newXorSum = xorSum ^ pileArray[i];
        if (newXorSum < pileArray[i]) {
          const optimalMove = pileArray[i] - newXorSum;
          setMoveResult(`最优取法：从第 ${i + 1} 堆取走 ${optimalMove} 个物品`);
          return;
        }
      }
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">尼姆游戏 🎮</h1>
      <p className="text-gray-500 mb-6 text-center">
        尼姆游戏是一种经典的两人游戏，玩家轮流从一堆或多堆物品中取走物品，每次取走一个或多个物品。若一方无法进行合法操作，则对方获胜。
      </p>

      <Card className="mb-8">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">如何求解</h2>
          <p className="text-sm text-gray-600">
            游戏的关键在于“异或”运算。如果所有堆的物品数异或结果为 0，那么当前局面是失败的，无法获胜。如果异或结果不为 0，则当前玩家可以通过取走合适数量的物品来获胜。关键点是：
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>计算所有堆的异或和。</li>
            <li>如果异或和为 0，当前局面无法获胜。</li>
            <li>如果异或和不为 0，找到可以让异或和变为 0 的最佳操作。</li>
          </ul>
        </CardContent>
      </Card>

      <div className="mb-6">
        <Input
          placeholder="输入堆数（例如：3  4  5）"
          value={piles}
          onChange={(e) => setPiles(e.target.value)}
          className="w-full max-w-md mx-auto"
        />
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={handleCalculateMove}>计算最优取法</Button>
      </div>

      <div className="mt-6">
        {moveResult && <p className="text-lg text-center">{moveResult}</p>}
        {isWinning !== null && (
          <p className="text-lg text-center mt-4">
            {isWinning
              ? "当前局面可以获胜！"
              : "当前局面无法获胜，对方不犯错的情况下你无法获胜。"}
          </p>
        )}
      </div>
    </main>
  );
}
