"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box, Skeleton, Stack, Typography } from "@mui/material";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { useApiQuery } from "../lib/useApi";
import { getLoyaltyRules } from "../lib/api";
import RulesSkeleton from "./ui/RulesSkeleton";
import RuleValueRenderer, { prettifyKey } from "./RuleValueRenderer";
import { Icon } from "@iconify/react";
import type { LoyaltyRule } from "../lib/types";

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
    if (!Array.isArray(rulesQuery.data) || parsedRuleId === null) {
      return null;
    }
    const foundRule =
      rulesQuery.data.find((item) => Number(item?.id) === parsedRuleId) ?? null;

    return foundRule && typeof foundRule === "object" ? foundRule : null;
  }, [parsedRuleId, rulesQuery.data]);

  if (rulesQuery.isLoading) {
    return <RulesSkeleton />;
  }

  if (parsedRuleId === null) {
    return (
      <Card>
        <Typography color="error.main">Invalid rule id.</Typography>
      </Card>
    );
  }

  if (rulesQuery.error) {
    return (
      <Card>
        <Typography color="error.main">
          {rulesQuery.error instanceof Error
            ? rulesQuery.error.message
            : "Failed to load rule details."}
        </Typography>
      </Card>
    );
  }

  if (!rule) {
    return (
      <Card>
        <Typography color="error.main">Rule not found.</Typography>
      </Card>
    );
  }

  const ruleEntries = Object.entries(rule);

  return (
    <Card
      title="Rule Details"
      subtitle={`Full information of the rule with ID: ${rule.id}`}
      sideComponents={
        <Box
          sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
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
        </Box>
      }
    >
      <Stack spacing={2}>
        {ruleEntries.map(([key, value]) => (
          <Box
            key={key}
            sx={{
              border: "1px solid",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 20%, transparent)",
              borderRadius: 2,
              p: 2,
              boxShadow:
                "0 8px 8px -8px color-mix(in srgb, var(--color-primary) 35%, transparent)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: 0.6,
              }}
            >
              {prettifyKey(key)}
            </Typography>
            <Box sx={{ mt: 0.25 }}>
              <RuleValueRenderer value={value} itemKey={key} depth={0} />
            </Box>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
