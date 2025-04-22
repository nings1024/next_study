import { publicProcedure, router } from "../trpc";
// import { prisma } from "@/lib/prisma"
import { z } from "zod";

export const postRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1).optional(),  // 页码，默认1，必须是正整数
        pageSize: z.number().int().positive().max(100).default(10).optional()  // 每页数量，默认10，最大100
      })
    )
    .query(async ( input) => {
      console.log(input)
      return {
        data: "Hello World",
      };
    }),
    test:publicProcedure.query(async (p)=>{
      console.log(p)
      return {message:'hello world'}
    }),
    test1:publicProcedure.mutation(async (p)=>{
      console.log(p)
      return {message:'hello world'}
    })
});