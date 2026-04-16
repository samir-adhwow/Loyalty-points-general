"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, Skeleton, Stack, Typography } from "@mui/material";
import Table from "./ui/Table";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { columns_RuleList } from "../const/columns";
import RulesSkeleton from "./ui/RulesSkeleton";

export default function RuleList({
  rules = [],
  error = null,
  loading = false,
  fromDashboard = false,
}: {
  rules?: any[];
  error?: string | null;
  loading?: boolean;
  fromDashboard?: boolean;
}) {
  const router = useRouter();

  const handleViewRule = useCallback(
    (rule: { id?: string }) => {
      if (!rule?.id) return;
      router.push(`/rules/${rule.id}/view`);
    },
    [router],
  );

  const handleEditRule = useCallback(
    (rule: { id?: string }) => {
      if (!rule?.id) return;
      router.push(`/rules/${rule.id}/edit`);
    },
    [router],
  );

  const seeAllRules = useCallback(() => {
    router.push("/rules");
  }, [router]);

  const columnsWithActions = [
    ...columns_RuleList,
    {
      field: "actions",
      headerName: "Actions",
      align: "center",
      cellSx: { whiteSpace: "nowrap" },
      renderCell: (_: unknown, row: { id?: string }) => (
        <div className="flex gap-4 justify-center">
          <Button className="btn_ghost" onClick={() => handleViewRule(row)}>
            View
          </Button>
          <Button className="btn_secondary" onClick={() => handleEditRule(row)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card
      title="Existing Rules"
      sideComponents={
        fromDashboard ? (
          <Button
            text="See All"
            className="btn_secondary"
            onClick={seeAllRules}
          />
        ) : null
      }
    >
      <Box>
        {loading ? (
          <RulesSkeleton />
        ) : error ? (
          <Typography color="error.main">{error}</Typography>
        ) : (
          <Table columns={columnsWithActions} data={rules} />
        )}
      </Box>
    </Card>
  );
}
