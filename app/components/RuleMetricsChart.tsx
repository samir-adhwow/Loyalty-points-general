"use client";

import { BarChart } from "@mui/x-charts/BarChart";
import Card from "./ui/Card";
import { useApiQuery } from "@/app/lib/useApi";
import { getRuleMetrics } from "@/app/lib/api";
import RulesSkeleton from "./ui/RulesSkeleton";

export function RuleMetricsChart() {
  const {
    data: ruleMetrics,
    isLoading,
    error,
  } = useApiQuery({
    queryKey: ["ruleMetrics"],
    queryFn: async () => {
      const response = await getRuleMetrics();
      return response?.data || [];
    },
    fallbackData: [],
  });

  if (isLoading) {
    return <RulesSkeleton />;
  }

  const chartData =
    ruleMetrics?.map((metric) => ({
      ruleName: metric.ruleName,
      totalPointsOriginal: metric.totalPointsOriginal,
      totalPointsRemaining: metric.totalPointsRemaining,
      expiredPoints: metric.expiredPoints,
      bucketCount: metric.bucketCount,
    })) || [];

  const chartSetting = {
    yAxis: [
      {
        label: "Points",
      },
    ],
    series: [
      { dataKey: "totalPointsOriginal", label: "Total Points Issued" },
      { dataKey: "totalPointsRemaining", label: "Total Points Remaining" },
      { dataKey: "expiredPoints", label: "Expired Points" },
    ],
    height: 300,
  };

  return (
    <Card title="Rule Metric">
      {chartData.length > 0 ? (
        <>
          <BarChart
            dataset={chartData}
            xAxis={[{ scaleType: "band", dataKey: "ruleName" }]}
            {...chartSetting}
          />
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Bucket Counts</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bucket Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chartData.map((item) => (
                    <tr key={item.ruleName}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.ruleName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.bucketCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div
          className="text-center py-16 border border-light rounded-lg"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 5%, transparent) 0%, rgba(255, 255, 255, 1) 22%)",
          }}
        >
          <h3 className="text-xl font-semibold mb-2">No data yet</h3>
          <p className="text-gray-500">
            There is no data to display at the moment.
          </p>
        </div>
      )}
    </Card>
  );
}
