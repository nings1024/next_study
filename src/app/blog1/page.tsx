'use client';

import { trpc } from '@/lib/trpc/client';

export default function Home() {
  const greeting = trpc.greet.useQuery({ name: 'tRPC user' });

  return (
    <main>
      <h1>{greeting.data?.greeting ?? 'Loading...'}</h1>
    </main>
  );
}