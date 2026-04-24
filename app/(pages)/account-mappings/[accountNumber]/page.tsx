"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import toast from "react-hot-toast";
import Card from "../../../components/ui/Card";
import Table from "../../../components/ui/Table";
import { getLoyaltyBalance, getLoyaltyTransactions } from "@/app/lib/api";
import {
  balanceColumns_LoyaltyAccountPanel,
  columns_LoyaltyAccountPanel,
} from "../../../const/columns";
import { useParams } from "next/navigation";

const expiringSoonColumns = [
  { field: "bucket", headerName: "Expiry Bucket" },
  { field: "points", headerName: "Points", align: "right" },
];

export default function LoyaltyAccountPanel() {
  const { accountNumber } = useParams();
  const normalizedAccountNumber =
    typeof accountNumber === "string"
      ? accountNumber
      : Array.isArray(accountNumber)
        ? (accountNumber[0] ?? "")
        : "";

  const [balance, setBalance] = useState<Record<string, any> | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const balanceRows = useMemo(() => {
    if (!balance || typeof balance !== "object") return [];
    return [
      {
        loyaltyAccountId: balance?.loyaltyAccountId ?? "-",
        balance: balance?.balance ?? "-",
        lifetimeEarned: balance?.lifetimeEarned ?? "-",
        lifetimeBurned: balance?.lifetimeBurned ?? "-",
        lifetimeExpired: balance?.lifetimeExpired ?? "-",
        lastActivityAt: balance?.lastActivityAt ?? "-",
      },
    ];
  }, [balance]);

  const expiringSoonRows = useMemo(() => {
    if (!balance?.expiringSoon || typeof balance.expiringSoon !== "object") {
      return [];
    }
    return Object.entries(balance.expiringSoon).map(([bucket, points]) => ({
      bucket,
      points,
    }));
  }, [balance]);

  const handleFetch = useCallback(async () => {
    const trimmedAccountNumber = normalizedAccountNumber.trim();
    if (!trimmedAccountNumber) {
      toast.error("Account number cannot be empty.");
      return;
    }

    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        getLoyaltyBalance(trimmedAccountNumber),
        getLoyaltyTransactions({ accountNumber: trimmedAccountNumber }),
      ]);

      setBalance(balanceRes?.data ?? null);
      const transactionItems = Array.isArray(transactionsRes?.data?.content)
        ? transactionsRes.data.content
        : Array.isArray(transactionsRes?.data)
          ? transactionsRes.data
          : [];
      setTransactions(transactionItems);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to fetch balance and transactions.";
      toast.error(message);
      setBalance(null);
      setTransactions([]);
    }
  }, [normalizedAccountNumber]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return (
    <Card title="Account Insights">
      <div className="space-y-12">
        {balanceRows.length ? (
          <Box>
            <Typography className="small-pill w-fit px-3 py-1" sx={{ mb: 1 }}>
              Current Balance
            </Typography>
            <Table
              columns={balanceColumns_LoyaltyAccountPanel(
                normalizedAccountNumber,
              )}
              data={balanceRows}
            />

            {expiringSoonRows.length ? (
              <Box sx={{ mt: 2.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.25, fontWeight: 700 }}
                >
                  Expiring Soon
                </Typography>
                <Table columns={expiringSoonColumns} data={expiringSoonRows} />
              </Box>
            ) : null}
          </Box>
        ) : null}

        <div className="">
          <Box>
            <Typography className="small-pill w-fit px-3 py-1" sx={{ mb: 1 }}>
              Transactions
            </Typography>
            <Table columns={columns_LoyaltyAccountPanel} data={transactions} />
          </Box>
        </div>
      </div>
    </Card>
  );
}
