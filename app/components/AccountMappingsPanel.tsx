"use client";

import { Box, Stack, Typography } from "@mui/material";
import Card from "./ui/Card";
import Table from "./ui/Table";
import { useApiQuery } from "../lib/useApi";
import { getAccountMappings } from "../lib/api";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import { account_mapping_columns } from "../const/columns";

export default function AccountMappingsPanel() {
  const { data, error } = useApiQuery({
    queryKey: ["account-mappings"],
    queryFn: () => getAccountMappings(),
    fallbackData: {},
  });

  const router = useRouter();

  const accountMappingColumns = [
    ...account_mapping_columns,
    {
      field: "actions",
      headerName: "Actions",
      align: "center",
      cellSx: { whiteSpace: "nowrap" },
      renderCell: (_: unknown, row: any) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
          <Button
            className="btn_secondary"
            onClick={() =>
              router.push(`/account-mappings/${row.accountNumber}`)
            }
          >
            View
          </Button>
        </Stack>
      ),
    },
  ];

  const rows = Array.isArray(data?.pageItems) ? data.pageItems : [];

  return (
    <Card title="Account Mappings">
      <div className="space-y-4">
        <Box>
          <Table columns={accountMappingColumns} data={rows} />
        </Box>
      </div>
    </Card>
  );
}
