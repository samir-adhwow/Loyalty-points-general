const toLocalInputDateTime = (date: Date) => date.toISOString().slice(0, 16);
export const defaultAppliesFrom = () => toLocalInputDateTime(new Date());
export const defaultAppliesTo = () =>
  toLocalInputDateTime(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

export const normalizeEnumValue = (
  value: unknown,
  fallback: string,
  map: Record<number, string> = {},
) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number" && map[value]) return map[value];
  return String(value);
};

export const normalizePriorityValue = (value: unknown) => {
  if (typeof value === "number" && [1, 2, 3].includes(value)) return value;
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    const enumMap = { LOW: 1, MEDIUM: 2, HIGH: 3 } as const;
    if (normalized in enumMap)
      return enumMap[normalized as keyof typeof enumMap];
    const parsed = Number(normalized);
    if ([1, 2, 3].includes(parsed)) return parsed;
  }
  return 1;
};

export const objectToRows = (value: unknown) => {
  try {
    const obj =
      typeof value === "string"
        ? JSON.parse(value || "{}")
        : value && typeof value === "object"
          ? value
          : {};
    const entries = Object.entries(obj);
    return entries.length > 0
      ? entries.map(([k, v]) => ({ key: k, value: String(v) }))
      : [];
  } catch {
    return [];
  }
};

export const tiersToPayload = (tiers: any[]) => {
  const cleaned = tiers
    .filter((t) => t.minAmount !== "" && t.points !== "")
    .map((t) => {
      const obj: { minAmount: number; points: number; maxAmount?: number } = {
        minAmount: Number(t.minAmount),
        points: Number(t.points),
      };
      if (t.maxAmount !== "") obj.maxAmount = Number(t.maxAmount);
      return obj;
    });
  return { tiers: cleaned };
};

export const payloadToTiers = (value: unknown) => {
  try {
    const obj =
      typeof value === "string"
        ? JSON.parse(value || "{}")
        : value && typeof value === "object"
          ? value
          : {};
    const tiers = obj?.tiers;
    if (!Array.isArray(tiers) || tiers.length === 0) return [];
    return tiers.map((t) => ({
      minAmount: t.minAmount !== undefined ? String(t.minAmount) : "",
      maxAmount: t.maxAmount !== undefined ? String(t.maxAmount) : "",
      points: t.points !== undefined ? String(t.points) : "",
    }));
  } catch {
    return [];
  }
};

export const rowsToObject = (rows: { key: string; value: string }[]) =>
  rows.reduce((acc: Record<string, string>, { key, value }) => {
    if (key.trim()) acc[key.trim()] = value;
    return acc;
  }, {});

export const getInitialCreateForm = () => ({
  id: "",
  code: "",
  name: "",
  description: "",
  ruleType: "TRANSACTION_EVENT",
  eventType: "",
  rewardType: "FIXED",
  rewardMode: "FIXED",
  rewardValue: "",
  multiplier: "",
  minEventValue: "",
  maxPointsPerTxn: "",
  priority: 1,
  status: "ACTIVE",
  appliesFrom: defaultAppliesFrom(),
  appliesTo: defaultAppliesTo(),
  expiryDays: "",
});

export const getEditFormFromRule = (rule: any) => ({
  ...getInitialCreateForm(),
  ...rule,
  id: rule?.id ?? "",
  ruleType: normalizeEnumValue(rule?.ruleType, "TRANSACTION_EVENT", {
    1: "TRANSACTION_EVENT",
    2: "BEHAVIOURAL",
    3: "PROMOTIONAL",
  }),
  rewardType: normalizeEnumValue(rule?.rewardType, "FIXED", {
    1: "FIXED",
    2: "MULTIPLIER",
    3: "TIERED",
  }),
  status: normalizeEnumValue(rule?.status, "ACTIVE", {
    1: "ACTIVE",
    2: "DRAFT",
    3: "INACTIVE",
    4: "ARCHIVED",
  }),
  priority: normalizePriorityValue(rule?.priority),
  appliesFrom: rule?.appliesFrom || defaultAppliesFrom(),
  appliesTo: rule?.appliesTo || defaultAppliesTo(),
  expiryDays:
    (typeof rule?.rewardPayload === "object"
      ? rule.rewardPayload?.expiryDays
      : typeof rule?.rewardPayload === "string"
        ? JSON.parse(rule.rewardPayload || "{}").expiryDays
        : undefined) ?? "",
  rewardMode: (() => {
    try {
      const p =
        typeof rule?.rewardPayload === "string"
          ? JSON.parse(rule.rewardPayload || "{}")
          : rule?.rewardPayload || {};
      return Array.isArray(p?.tiers) && p.tiers.length > 0
        ? "FLEXIBLE"
        : "FIXED";
    } catch {
      return "FIXED";
    }
  })(),
});
