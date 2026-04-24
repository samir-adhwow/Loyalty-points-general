"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { useApiQuery } from "../lib/useApi";
import { getLoyaltyRules } from "../lib/api";
import RulesSkeleton from "./ui/RulesSkeleton";
import RuleValueRenderer, { prettifyKey } from "./RuleValueRenderer";
import { Icon } from "@iconify/react";
import type { LoyaltyRule } from "../lib/types";
import FieldBox from "./ViewRule/FieldBox";
import SectionGroup from "./ViewRule/SectionGroup";
import FullWidthBox from "./ViewRule/FullWidthBox";

const GROUPS: {
  label: string;
  icon: string;
  keys: string[];
  cols?: string;
}[] = [
  {
    label: "Identity",
    icon: "fluent:tag-24-regular",
    keys: ["id", "code", "name", "description"],
    cols: "grid-cols-2 md:grid-cols-4",
  },
  {
    label: "Configuration",
    icon: "fluent:settings-24-regular",
    keys: ["ruleType", "eventType", "status", "priority"],
    cols: "grid-cols-2 md:grid-cols-4",
  },
  {
    label: "Schedule",
    icon: "fluent:calendar-24-regular",
    keys: ["appliesFrom", "appliesTo"],
    cols: "grid-cols-1 sm:grid-cols-2",
  },
  {
    label: "Reward",
    icon: "fluent:gift-24-regular",
    keys: [
      "rewardType",
      "rewardValue",
      "multiplier",
      "maxPointsPerTxn",
      "minEventValue",
    ],
    cols: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  },
];

const FULL_WIDTH_KEYS = ["rewardPayload", "criteriaExpression"];

export default function RuleDetailsPage({
  ruleId,
}: {
  ruleId: string | undefined;
}) {
  const router = useRouter();

  const parsedRuleId = useMemo(() => {
    const parsed = Number(ruleId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [ruleId]);

  const rulesQuery = useApiQuery({
    queryKey: ["loyalty-rules"],
    queryFn: async () => {
      const response = await getLoyaltyRules();
      return Array.isArray(response?.data) ? response.data : [];
    },
    fallbackData: [],
  });

  const rule = useMemo<LoyaltyRule | null>(() => {
    if (!Array.isArray(rulesQuery.data) || parsedRuleId === null) return null;
    const found =
      rulesQuery.data.find((item) => Number(item?.id) === parsedRuleId) ?? null;
    return found && typeof found === "object" ? found : null;
  }, [parsedRuleId, rulesQuery.data]);

  if (rulesQuery.isLoading) return <RulesSkeleton />;
  if (parsedRuleId === null)
    return (
      <Card>
        <p className="text-red-500">Invalid rule id.</p>
      </Card>
    );
  if (rulesQuery.error)
    return (
      <Card>
        <p className="text-red-500">
          {rulesQuery.error instanceof Error
            ? rulesQuery.error.message
            : "Failed to load rule details."}
        </p>
      </Card>
    );
  if (!rule)
    return (
      <Card>
        <p className="text-red-500">Rule not found.</p>
      </Card>
    );

  const ruleRecord = rule as Record<string, unknown>;

  // Ungrouped keys — anything not in GROUPS or FULL_WIDTH_KEYS
  const groupedKeys = new Set([
    ...GROUPS.flatMap((g) => g.keys),
    ...FULL_WIDTH_KEYS,
  ]);
  const ungroupedEntries = Object.entries(ruleRecord).filter(
    ([k]) => !groupedKeys.has(k),
  );

  return (
    <Card
      title="Rule Details"
      subtitle={`Full information of the rule with ID: ${rule.id}`}
      sideComponents={
        <div className="mt-2 flex justify-end gap-2">
          <Button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="btn_ghost gap-2"
          >
            <Icon icon="fluent-mdl2:back" />
            Back
          </Button>
          <Button
            type="button"
            onClick={() => router.push(`/rules/${rule.id}/edit`)}
          >
            Edit Rule
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-8 mt-2">
        {/* Defined groups */}
        {GROUPS.map((group) => (
          <SectionGroup
            key={group.label}
            label={group.label}
            icon={group.icon}
            keys={group.keys}
            cols={group.cols}
            rule={ruleRecord}
          />
        ))}

        {ungroupedEntries.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-5 rounded-full bg-primary" />
              <span className="text-sm font-bold uppercase tracking-widest text-primary">
                Other
              </span>
              <span className="flex-1 border-t border-dashed border-gray-100" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ungroupedEntries.map(([key, value]) => (
                <FieldBox key={key} label={prettifyKey(key)} value={value} />
              ))}
            </div>
          </div>
        )}

        {FULL_WIDTH_KEYS.some((k) => k in ruleRecord) && (
          <div className="flex flex-col gap-3 pt-2 border-t border-dashed border-primary">
            {FULL_WIDTH_KEYS.filter((k) => k in ruleRecord).map((key) => (
              <FullWidthBox
                key={key}
                label={prettifyKey(key)}
                value={ruleRecord[key]}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
