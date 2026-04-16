"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography } from "@mui/material";
import Card from "./ui/Card";
import FormTextField from "./ui/FormTextField";
import Button from "./ui/Button";
import Table from "./ui/Table";
import CreateLoyaltyPointDetails from "./CreateLoyaltyPointDetails";
import { useApiQuery } from "../lib/useApi";
import { getLoyaltyPointDetails } from "@/app/lib/api";
import { loyaltyPointDetailsFilterSchema } from "@/app/lib/validation/loyaltyPointDetailsSchema";
import { columns_LoyaltyDetailsPanel } from "../const/columns";
import type { z } from "zod";

type FilterFormValues = z.infer<typeof loyaltyPointDetailsFilterSchema>;

function normalizeDetails(payload: any) {
  if (!payload) return [];

  const accountId = payload.accountId ?? "-";
  const externalAccountId = payload.externalAccountId ?? "-";
  const totalLoyaltyPoint = payload.totalLoyaltyPoint ?? "-";

  const response = payload?.accountLoyaltyPointResponse;
  const pageItems: any[] =
    response?.pageItems || response?.items || response?.content || [];

  if (!Array.isArray(pageItems)) return [];

  return pageItems.map((item, index) => ({
    rowId: `${item?.id ?? index}-${item?.date ?? ""}`,
    accountId,
    externalAccountId,
    totalLoyaltyPoint,
    id: item?.id ?? "-",
    ruleId: item?.ruleId ?? "-",
    userTransactionLogId: item?.userTransactionLogId ?? "-",
    transactionAmount: item?.transactionAmount ?? "-",
    loyaltyPoint: item?.loyaltyPoint ?? "-",
    date: item?.date ?? "-",
    accountNumber: item?.accountNumber ?? "-",
    system: item?.system ?? "-",
  }));
}

export default function LoyaltyPointDetailsPanel() {
  const filterForm = useForm<FilterFormValues>({
    resolver: zodResolver(loyaltyPointDetailsFilterSchema),
    defaultValues: {
      externalAccountId: "",
      page: 0,
      pageSize: 10,
    },
  });

  const [activeExternalAccountId, activePage, activePageSize] = useWatch({
    control: filterForm.control,
    name: ["externalAccountId", "page", "pageSize"],
  });

  const detailsQuery = useApiQuery(
    {
      queryKey: [
        "loyalty-point-details",
        activeExternalAccountId,
        activePage,
        activePageSize,
      ],
      queryFn: () => getLoyaltyPointDetails(filterForm.getValues()),
      fallbackData: {},
    },
    { enabled: Boolean(activeExternalAccountId) },
  );

  const detailsRows = useMemo(
    () => normalizeDetails(detailsQuery.data),
    [detailsQuery.data],
  );

  const handleFetch = filterForm.handleSubmit(() => {
    filterForm.setValue("page", 0);
  });

  return (
    <div className="space-y-6">
      <CreateLoyaltyPointDetails />

      <Card title="Loyalty Point Details">
        <div className="space-y-4">
          <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-4">
            {(() => {
              const { ref, ...registered } =
                filterForm.register("externalAccountId");
              return (
                <FormTextField
                  required
                  label="External Account ID"
                  inputRef={ref}
                  error={Boolean(filterForm.formState.errors.externalAccountId)}
                  helperText={
                    filterForm.formState.errors.externalAccountId?.message ??
                    " "
                  }
                  {...registered}
                />
              );
            })()}
            <div className="mb-2 flex">
              <Button
                onClick={handleFetch}
                disabled={detailsQuery.isFetching}
                text={detailsQuery.isFetching ? "Loading..." : "Fetch Details"}
              />
            </div>
          </div>

          <Box>
            <Table columns={columns_LoyaltyDetailsPanel} data={detailsRows} />
          </Box>
        </div>
      </Card>
    </div>
  );
}
