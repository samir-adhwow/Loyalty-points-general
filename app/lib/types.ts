export type CreateRulePayload = {
  id?: number;
  code: string;
  name: string;
  description: string;
  ruleType: string | number;
  eventType: string;
  rewardType: string | number;
  rewardValue: number;
  multiplier: number | null;
  minEventValue: number | null;
  maxPointsPerTxn: number | null;
  priority: number;
  status: string | number;
  appliesFrom: string | Date;
  appliesTo: string | Date;
  criteriaExpression: Record<string, string>;
  rewardPayload: Record<string, string>;
};

export type LoyaltyRule = {
  id: number;
  code: string;
  name: string;
  description: string;
  ruleType: string | number;
  eventType: string;
  rewardType: string | number;
  rewardValue: number;
  multiplier: number | null;
  minEventValue: number | null;
  maxPointsPerTxn: number | null;
  priority: number;
  status: string | number;
  appliesFrom: string;
  appliesTo: string;
  criteriaExpression: Record<string, unknown>;
  rewardPayload: Record<string, unknown>;
};

export type ApiListResponse<T> = {
  code: string;
  message: string;
  data: T[];
  timestamp: string;
  metadata: string;
};

export type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
  timestamp: string;
  metadata?: string;
};

export type LoyaltyTransactionsParams = {
  accountNumber?: string;
  externalAccount?: string;
  page?: number;
  size?: number;
};

export type LoyaltyPointDetailsParams = {
  externalAccountId: string;
  page?: number;
  pageSize?: number;
};

export type AddLoyaltyPointRequest = {
  externalAccount: string;
  system: string;
  cardProductId: string;
  transactionAmount: number;
  transactionId: number;
};

export type AccountMappingsParams = {
  page?: number;
  pageSize?: number;
  externalAccountId?: string;
};

export type RuleMetricsResponse = {
  ruleId: number;
  ruleCode: string;
  ruleName: string;
  totalPointsOriginal: number;
  totalPointsRemaining: number;
  expiredPoints: number;
  bucketCount: number;
  windowFrom: string;
  windowTo: string;
};
