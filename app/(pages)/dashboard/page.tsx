"use client";

import { getLoyaltyRules } from "@/app/lib/api";
import { useApiQuery } from "@/app/lib/useApi";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import RuleList from "@/app/components/RuleList";
import { useRouter } from "next/navigation";
import { RuleMetricsChart } from "@/app/components/RuleMetricsChart";

export default function DashboardPage() {
  const router = useRouter();

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

  const recentRules = [...rules].slice(-3).reverse();

  const formatDate = (value: string | number | Date) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  return (
    <div className="flex w-full flex-col space-y-6">
      <Card childClassName="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full max-w-xl text-left py-4">
          <div className="mb-4">
            <span className="small-pill px-4 py-2">Loyalty Control Room</span>
          </div>

          <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
            Demonstrate{" "}
            <span className="text-primary">Earn, Burn & Expiry</span>
          </h2>

          <p className="mb-8 text-sm text-dark sm:text-base">
            Create and manage loyalty rules in one guided story.
          </p>
          <div className="mt-16">
            <Button
              onClick={() => router.push("/rules/create")}
              text="Create Loyalty Rule"
            />
          </div>
        </div>

        <div className="w-full rounded-xl border border-primary/30 bg-primary/10 p-4 lg:max-w-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-darker">Recent Rules:</h3>
            <span className="small-pill px-2 py-1">
              Total: {rules.length} rules
            </span>
          </div>

          {recentRules.length > 0 ? (
            <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
              {recentRules.map((rule) => (
                <li
                  key={rule.id}
                  className="rounded-md border border-light bg-white px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-darker">
                      {rule.name || rule.code}
                    </p>
                    <span className="rounded bg-light px-2 py-0.5 text-xs text-dark">
                      #{rule.id}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-dark">
                    {rule.code} • {formatDate(rule.appliesFrom)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-dark">No recent activity to display.</p>
          )}
        </div>
      </Card>

      <RuleMetricsChart />

      <RuleList
        rules={rules.slice(0, 5)}
        error={error instanceof Error ? error.message : ""}
        loading={loadingRules}
        fromDashboard={true}
      />
    </div>
  );
}
