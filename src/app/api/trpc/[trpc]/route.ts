// src/app/api/trpc/[trpc]/route.ts
import { appRouter } from '@/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (req: Request) =>
{
  console.log('请求url',req.url)
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  })};

export { handler as GET, handler as POST };