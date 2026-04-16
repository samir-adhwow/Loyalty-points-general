"use client";

import RuleList from "@/app/components/RuleList";
import { getLoyaltyRules } from "@/app/lib/api";
import { useApiQuery } from "@/app/lib/useApi";

export default function RulesPage() {
  const {
    data: rules = [],
    isLoading: loadingRules,
    error,
  } = useApiQuery({
    queryKey: ["loyalty-rules"],
    queryFn: async () => {
      const response = await getLoyaltyRules();
      return Array.isArray(response?.data) ? response.data : [];
    },
    fallbackData: [],
  });

  return (
    <div className="flex w-full flex-col space-y-6">
      <RuleList
        rules={rules}
        error={error instanceof Error ? error.message : ""}
        loading={loadingRules}
      />
    </div>
  );
}
