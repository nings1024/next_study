// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 max-w-3xl mx-auto text-center space-y-4">
      <h1 className="text-4xl font-bold mb-4">欢迎来到开发者小工具站</h1>
      <p className="text-gray-600">集合了实用工具与有趣逻辑题的资源导航</p>

      <div className="flex justify-center gap-4 mt-6">
        <Link href="/tools" className="text-blue-500 hover:underline text-lg">
          🔧 开发工具
        </Link>
        <Link href="/puzzles" className="text-purple-500 hover:underline text-lg">
          🧠 逻辑谜题
        </Link>
        <Link href="/puzzles" className="text-purple-500 hover:underline text-lg">
          🕹️ 小游戏
        </Link>
      </div>
    </main>
  );
}
