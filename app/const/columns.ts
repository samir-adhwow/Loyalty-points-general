export const columns_RuleList = [
  { field: "id", headerName: "ID" },
  { field: "code", headerName: "Code" },
  { field: "name", headerName: "Name" },
  { field: "ruleType", headerName: "Rule Type" },
  { field: "eventType", headerName: "Event Type" },
  { field: "rewardType", headerName: "Reward Type" },
  { field: "rewardValue", headerName: "Reward" },
  {
    field: "appliesFrom",
    headerName: "From",
    renderCell: (value: string | null | Date) => {
      if (!value) return "-";
      return new Date(value).toLocaleString();
    },
  },
  { field: "status", headerName: "Status" },
];

export const columns_LoyaltyDetailsPanel = [
  { field: "accountId", headerName: "Account Id" },
  { field: "externalAccountId", headerName: "External Account Id" },
  {
    field: "totalLoyaltyPoint",
    headerName: "Total Loyalty Point",
    align: "right",
  },
  { field: "id", headerName: "Id" },
  { field: "ruleId", headerName: "Rule Id" },
  { field: "userTransactionLogId", headerName: "User Transaction Log Id" },
  {
    field: "transactionAmount",
    headerName: "Transaction Amount",
    align: "right",
  },
  { field: "loyaltyPoint", headerName: "Loyalty Point", align: "right" },
  {
    field: "date",
    headerName: "Date",
    renderCell: (value: string | null | Date) => {
      if (!value || value === "-") return "-";
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString();
    },
  },
  { field: "accountNumber", headerName: "Account Number" },
  { field: "system", headerName: "System" },
];

export const account_mapping_columns = [
  { field: "id", headerName: "ID" },
  { field: "accountNumber", headerName: "Account Number" },
  { field: "externalAccount", headerName: "External Account" },
  { field: "system", headerName: "System" },
  {
    field: "createdDate",
    headerName: "Created Date",
    renderCell: (value: string | number | null | undefined) => {
      if (!value) return "-";
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString();
    },
  },
  { field: "createdBy", headerName: "Created By" },
  {
    field: "lastUpdatedDate",
    headerName: "Last Updated Date",
    renderCell: (value: string | number | null | undefined) => {
      if (!value) return "-";
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString();
    },
  },
  { field: "lastUpdatedBy", headerName: "Last Updated By" },
];

export const columns_LoyaltyAccountPanel = [
  { field: "id", headerName: "Id" },
  { field: "transactionType", headerName: "Transaction Type" },
  { field: "transactionStatus", headerName: "Status" },
  { field: "pointsDelta", headerName: "Points Delta", align: "right" },
  { field: "pointsBefore", headerName: "Points Before", align: "right" },
  { field: "pointsAfter", headerName: "Points After", align: "right" },
  { field: "referenceId", headerName: "Reference Id" },
  { field: "referenceType", headerName: "Reference Type" },
  { field: "channel", headerName: "Channel" },
  {
    field: "occurredAt",
    headerName: "Occurred At",
    renderCell: (value: string | null | Date) => {
      if (!value) return "-";
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString();
    },
  },
];

export const balanceColumns_LoyaltyAccountPanel = [
  { field: "loyaltyAccountId", headerName: "Loyalty Account Id" },
  { field: "balance", headerName: "Balance", align: "right" },
  { field: "lifetimeEarned", headerName: "Lifetime Earned", align: "right" },
  { field: "lifetimeBurned", headerName: "Lifetime Burned", align: "right" },
  {
    field: "lifetimeExpired",
    headerName: "Lifetime Expired",
    align: "right",
  },
  {
    field: "lastActivityAt",
    headerName: "Last Activity",
    renderCell: (value: string | null | Date) => {
      if (!value) return "-";
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString();
    },
  },
];
