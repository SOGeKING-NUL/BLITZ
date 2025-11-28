import {tool} from "ai";
import z from "zod";

export const custom_additionTool= tool({
  description: "adds 2 numbers given given by user",
  inputSchema: z.object({
    numbers: z.array( 
      z.number().describe("a number mentioned by the user"))
      .min(2, "atleast 2 numbers required")
  }),
  execute: async ({numbers}) => {
    return numbers.reduce((sum, n) => sum + n, 0);
  }
});
