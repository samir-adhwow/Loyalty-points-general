import { z } from "zod";

export const createLoyaltyPointDetailsSchema = z.object({
  externalAccount: z.string().trim().min(1, "External Account is required."),
  system: z.string().trim().min(1, "System is required."),
  cardProductId: z.string().trim().min(1, "Card Product Id is required."),
  transactionAmount: z
    .number()
    .finite("Transaction Amount must be a valid number.")
    .min(1, "Transaction Amount must be a positive number.")
    .max(999999.99999, "Transaction Amount seems unreasonably high."),
  transactionId: z
    .number()
    .int("Transaction Id must be an integer.")
    .min(1, "Transaction Id must be a positive integer."),
});

export const loyaltyPointDetailsFilterSchema = z.object({
  externalAccountId: z
    .string()
    .trim()
    .min(1, "External Account Id is required."),
  page: z.number().int().min(0, "Page cannot be negative."),
  pageSize: z.number().int().min(1, "Page Size must be at least 1."),
});
