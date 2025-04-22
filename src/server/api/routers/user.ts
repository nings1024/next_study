import { publicProcedure, router } from "../trpc";

export const userRouter = router({
  good: publicProcedure.query(({  }) => {
    return `GoodBye!`;
  }),
});
