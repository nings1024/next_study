import { publicProcedure, router } from "../trpc";
import { z } from "zod";

export const postRouter = router({
  hello: publicProcedure.query(({ input }) => {
    return `Hello`;
  }),
});
