import { publicProcedure, router } from "../trpc";
import { z } from "zod";

export const userRouter = router({
  good: publicProcedure.query(({ input }) => {
    return `GoodBye!`;
  }),
});
