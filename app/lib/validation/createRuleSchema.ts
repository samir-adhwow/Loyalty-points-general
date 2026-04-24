import { z } from "zod";

const isoDateString = z.preprocess((value): string | null => {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value !== "string") return value as string;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
}, z.string().datetime().nullable());

const parseJsonObjectField = (fieldName: string) =>
  z.preprocess(
    (value): Record<string, string> => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value || "{}");
        } catch {
          return value as never;
        }
      }
      return value as Record<string, string>;
    },
    z
      .record(z.string(), z.string())
      .refine((v) => v !== null && !Array.isArray(v), {
        message: `${fieldName} must be a JSON object.`,
      }),
  );

const nullableNonNegativeNumber = (label: string) =>
  z.preprocess(
    (value): number | null => {
      if (value === "" || value === null || value === undefined) return null;
      if (typeof value === "number") return value;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? (value as number) : parsed;
    },
    z.number().min(0, `${label} cannot be negative.`).nullable(),
  );

const requiredIsoDateString = z.preprocess((value): string => {
  if (typeof value !== "string" || value === "") return value as string;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
}, z.string().datetime());

export const createRulePayloadSchema = z
  .object({
    code: z.string().trim().min(1, "Code is required."),
    name: z.string().trim().min(1, "Name is required."),
    description: z.string().trim(),
    ruleType: z.string().trim().min(1, "Rule type is required."),
    eventType: z.string().trim().min(1, "Event type is required."),
    rewardType: z.string().min(1, "Reward type is required."),
    rewardValue: z.coerce.number().min(0, "Reward value cannot be negative."),
    multiplier: nullableNonNegativeNumber("Multiplier"),
    minEventValue: nullableNonNegativeNumber("Min event value"),
    maxPointsPerTxn: nullableNonNegativeNumber("Max points per transaction"),
    blackoutFrom: isoDateString.optional().nullable(),
    blackoutTo: isoDateString.optional().nullable(),
    priority: z.coerce
      .number()
      .int()
      .min(1, "Priority is required.")
      .max(3, "Priority must be LOW, MEDIUM, or HIGH."),
    status: z.string().min(1, "Status is required."),
    appliesFrom: requiredIsoDateString,
    appliesTo: requiredIsoDateString,
    maxPointsDaily: nullableNonNegativeNumber("Max points daily"),
    maxPointsWeekly: nullableNonNegativeNumber("Max points weekly"),
    maxPointsMonthly: nullableNonNegativeNumber("Max points monthly"),
    partnerId: nullableNonNegativeNumber("Partner ID"),
    criteriaExpression: parseJsonObjectField("Criteria Expression"),
    rewardPayload: parseJsonObjectField("Reward Payload"),
  })
  .refine(
    (payload) => new Date(payload.appliesTo) >= new Date(payload.appliesFrom),
    {
      message: "Applies To must be later than or equal to Applies From.",
      path: ["appliesTo"],
    },
  )
  .refine(
    (payload) =>
      !payload.blackoutFrom ||
      !payload.blackoutTo ||
      new Date(payload.blackoutTo) >= new Date(payload.blackoutFrom),
    {
      message: "Blackout To must be later than or equal to Blackout From.",
      path: ["blackoutTo"],
    },
  )
  .refine(
    (payload) =>
      payload.rewardType !== "PERCENTAGE" ||
      (typeof payload.rewardValue === "number" && payload.rewardValue <= 100),
    {
      message: "Percentage cannot exceed 100%",
      path: ["rewardValue"],
    },
  );
