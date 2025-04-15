'use client';
import { trpc } from '@/app/_trpc/client';

export default function Home() {
  const getTodos=trpc.user.good.useQuery();
  return (
    <main>
      <h1>{JSON.stringify(getTodos.data)}</h1>
    </main>
  );
}