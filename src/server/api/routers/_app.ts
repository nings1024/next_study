import { router } from "../trpc";
import { postRouter } from "./post";
import { userRouter } from "./user"; // import

export const appRouter = router({
  post: postRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
