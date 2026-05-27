import { z } from "zod"

export const createWaitlistSchema = z.object({
  email: z.string().email(),
  source: z.string().optional().default("website"),
})

export type CreateWaitlistInput = z.infer<typeof createWaitlistSchema>
