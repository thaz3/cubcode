import { z } from "zod";

export const offlineTokenDealSchema = z.object({
  cubId: z.string().min(1, "Choose a Cub"),
  dealType: z.enum(["earn", "spend"], {
    error: "Choose whether tokens are earned or cashed in",
  }),
  tokenAmount: z.coerce
    .number()
    .int()
    .min(1, "Enter at least 1 token")
    .max(50, "Maximum 50 tokens per deal"),
  agreement: z
    .string()
    .trim()
    .min(3, "Describe what you agreed on")
    .max(500),
});
