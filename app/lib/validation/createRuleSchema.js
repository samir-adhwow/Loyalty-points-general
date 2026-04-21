import { z } from "zod";

const isoDateString = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toISOString();
  },
  z.string().datetime({ offset: true }).or(z.string().datetime()),
);

const parseJsonObjectField = (fieldName) =>
  z.any().transform((value, ctx) => {
    let parsedValue = value;

    if (typeof value === "string") {
      try {
        parsedValue = JSON.parse(value || "{}");
      } catch {
        ctx.addIssue({
          code: "custom",
          message: `${fieldName} must be valid JSON.`,
        });
        return z.NEVER;
      }
    }

    if (
      !parsedValue ||
      typeof parsedValue !== "object" ||
      Array.isArray(parsedValue)
    ) {
      ctx.addIssue({
        code: "custom",
        message: `${fieldName} must be a JSON object.`,
      });
      return z.NEVER;
    }

    return parsedValue;
  });

const nullableNonNegativeNumber = (label) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) return null;
      if (typeof value === "number") return value;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    },
    z.number().min(0, `${label} cannot be negative.`).nullable(),
  );

export const createRulePayloadSchema = z
  .object({
    // id: z.number().int().min(1, "ID must be a positive integer."),
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
    blackoutFrom: isoDateString.optional(),
    blackoutTo: isoDateString.optional(),
    priority: z.coerce
      .number()
      .int()
      .min(1, "Priority is required.")
      .max(3, "Priority must be LOW, MEDIUM, or HIGH."),
    status: z.string().min(1, "Status is required."),
    appliesFrom: isoDateString,
    appliesTo: isoDateString,
    maxPointsDaily: nullableNonNegativeNumber("Max points daily"),
    maxPointsWeekly: nullableNonNegativeNumber("Max points weekly"),
    maxPointsMonthly: nullableNonNegativeNumber("Max points monthly"),
    partnerId: z.coerce.number().int().optional(),
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
