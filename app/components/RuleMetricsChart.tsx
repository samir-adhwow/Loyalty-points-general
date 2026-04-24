"use client";

import { BarChart } from "@mui/x-charts/BarChart";
import Card from "./ui/Card";
import { useApiQuery } from "@/app/lib/useApi";
import { getRuleMetrics } from "@/app/lib/api";
import RulesSkeleton from "./ui/RulesSkeleton";
import { Icon } from "@iconify/react";

type RuleMetric = {
  bucketCount: number;
  expiredPoints: number;
  ruleCode: string;
  ruleId: number;
  ruleName: string;
  totalPointsOriginal: number;
  totalPointsRemaining: number;
  windowFrom: string;
  windowTo: string;
};

function StatPill({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: string;
  accent: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 ${accent}`}
    >
      <Icon icon={icon} className="text-base shrink-0 opacity-70" />
      <div className="flex flex-col min-w-0">
        <span className="text-[0.62rem] font-bold uppercase tracking-widest opacity-60 leading-none mb-0.5">
          {label}
        </span>
        <span className="text-sm font-bold tabular-nums leading-none">
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function WindowBadge({ from, to }: { from: string; to: string }) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return (
    <div className="flex gap-0.5 rounded-lg border border-lighter bg-lighter px-2 py-1.5 text-xs text-label text-nowrap">
      <div className="flex items-center gap-1">
        <span>{fmt(from)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Icon
          icon="fluent:arrow-right-16-regular"
          className="text-[0.6rem] text-label shrink-0"
        />
        <span>{fmt(to)}</span>
      </div>
    </div>
  );
}

// Shared column layout — same class applied to both header and every row
const COL = "grid grid-cols-[minmax(180px,1fr)_100px_100px_100px_180px]";

export function RuleMetricsChart() {
  const { data: ruleMetrics, isLoading } = useApiQuery({
    queryKey: ["ruleMetrics"],
    queryFn: async () => {
      const response = await getRuleMetrics();
      return (response?.data as RuleMetric[]) || [];
    },
    fallbackData: [] as RuleMetric[],
  });

  if (isLoading) return <RulesSkeleton />;

  const chartData =
    ruleMetrics?.map((m) => ({
      ruleName: m.ruleName,
      totalPointsOriginal: m.totalPointsOriginal,
      totalPointsRemaining: m.totalPointsRemaining,
      expiredPoints: m.expiredPoints,
    })) || [];

  const totals = ruleMetrics?.reduce(
    (acc, m) => ({
      issued: acc.issued + m.totalPointsOriginal,
      remaining: acc.remaining + m.totalPointsRemaining,
      expired: acc.expired + m.expiredPoints,
      buckets: acc.buckets + m.bucketCount,
    }),
    { issued: 0, remaining: 0, expired: 0, buckets: 0 },
  ) ?? { issued: 0, remaining: 0, expired: 0, buckets: 0 };

  return (
    <Card title="Rule Metrics">
      {chartData.length > 0 ? (
        <div className="flex flex-col gap-5">
          {/* ── Summary pills ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatPill
              label="Total Issued"
              value={totals.issued}
              icon="fluent:gift-24-regular"
              accent="border-primary/15 bg-primary/[0.04] text-primary"
            />
            <StatPill
              label="Remaining"
              value={totals.remaining}
              icon="fluent:checkmark-circle-24-regular"
              accent="border-emerald-100 bg-emerald-50/60 text-emerald-700"
            />
            <StatPill
              label="Expired"
              value={totals.expired}
              icon="fluent:clock-dismiss-24-regular"
              accent="border-rose-100 bg-rose-50/60 text-rose-600"
            />
            <StatPill
              label="Buckets"
              value={totals.buckets}
              icon="fluent:box-multiple-24-regular"
              accent="border-amber-100 bg-amber-50/60 text-amber-700"
            />
          </div>

          {/* ── Bar chart ── */}
          {chartData.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white px-2 pt-2 pb-1 shadow-sm overflow-x-auto">
              <BarChart
                dataset={chartData}
                xAxis={[{ scaleType: "band", dataKey: "ruleName" }]}
                yAxis={[{ label: "Points" }]}
                series={[
                  {
                    dataKey: "totalPointsOriginal",
                    label: "Issued",
                    color: "var(--color-primary)",
                  },
                  {
                    dataKey: "totalPointsRemaining",
                    label: "Remaining",
                    color: "#10b981",
                  },
                  {
                    dataKey: "expiredPoints",
                    label: "Expired",
                    color: "#f43f5e",
                  },
                ]}
                // Scale chart width with data so many bars don't squish
                width={Math.max(500, chartData.length * 120)}
                height={300}
              />
            </div>
          )}

          {/* ── Detail table ── */}
          <div className="rounded-xl border border-lighter overflow-hidden shadow-sm">
            {/* Scrollable wrapper for many rows */}
            <div className="overflow-x-auto">
              {/* Header */}
              <div
                className={`${COL} border-b border-light bg-lighter px-4 py-2.5`}
              >
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-label">
                  Rule
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-label">
                  Issued
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-label">
                  Remaining
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-label">
                  Expired
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-label">
                  Window
                </span>
              </div>

              {/* Rows */}
              {ruleMetrics?.map((m, i) => {
                const utilised =
                  m.totalPointsOriginal > 0
                    ? Math.round(
                        ((m.totalPointsOriginal - m.totalPointsRemaining) /
                          m.totalPointsOriginal) *
                          100,
                      )
                    : 0;

                return (
                  <div
                    key={m.ruleId}
                    className={`${COL} items-center px-4 py-3 transition-colors hover:bg-gray-50/60 ${
                      i !== ruleMetrics.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    {/* Rule name + code + utilisation bar */}
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800 truncate">
                          {m.ruleName}
                        </span>
                        <span className="shrink-0 rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-primary">
                          {m.ruleCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-24 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${utilised}%` }}
                          />
                        </div>
                        <span className="text-[0.6rem] text-gray-400 tabular-nums">
                          {utilised}% used
                        </span>
                      </div>
                    </div>

                    {/* Issued */}
                    <div className="text-left">
                      <span className="text-sm font-semibold tabular-nums text-gray-700">
                        {m.totalPointsOriginal.toLocaleString()}
                      </span>
                    </div>

                    {/* Remaining */}
                    <div className="text-left">
                      <span className="text-sm font-semibold tabular-nums text-emerald-600">
                        {m.totalPointsRemaining.toLocaleString()}
                      </span>
                    </div>

                    {/* Expired */}
                    <div className="text-left">
                      <span
                        className={`text-sm font-semibold tabular-nums ${m.expiredPoints > 0 ? "text-rose-500" : "text-gray-400"}`}
                      >
                        {m.expiredPoints.toLocaleString()}
                      </span>
                    </div>

                    {/* Window */}
                    <div className="flex justify-start">
                      <WindowBadge from={m.windowFrom} to={m.windowTo} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-light text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5">
            <Icon
              icon="fluent:data-bar-vertical-24-regular"
              className="text-2xl text-primary/50"
            />
          </div>
          <h3 className="text-base font-semibold text-darker mb-1">
            No metrics yet
          </h3>
          <p className="text-sm text-dark max-w-xs">
            Rule metrics will appear here once points activity is recorded.
          </p>
        </div>
      )}
    </Card>
  );
}
