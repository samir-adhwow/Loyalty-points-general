import {
  AddLoyaltyPointRequest,
  ApiListResponse,
  ApiResponse,
  CreateRulePayload,
  LoyaltyPointDetailsParams,
  LoyaltyRule,
  LoyaltyTransactionsParams,
  RuleMetricsResponse,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type QueryParams = Record<string, string | number | boolean>;

// ✅ Generic API request function
async function apiRequest(
  path: string,
  options?: RequestInit,
  params?: QueryParams,
) {
  let url = `${BASE_URL}${path}`;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ).toString();
    url += `?${query}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `API Error (${res.status})`;

    try {
      const errorBody = await res.json();
      if (errorBody?.message) {
        message = errorBody.message;
      } else if (errorBody?.code) {
        message = errorBody.code;
      }
    } catch {}

    throw new Error(message);
  }

  return res.json();
}

// ✅ Create a new loyalty rule
export function createLoyaltyRule(payload: CreateRulePayload) {
  return apiRequest("/internal/loyalty/rules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ✅ Fetch all loyalty rules
export function getLoyaltyRules() {
  return apiRequest("/internal/loyalty/rules", {
    method: "GET",
  }) as Promise<ApiListResponse<LoyaltyRule>>;
}

// ✅ Create loyalty point details
export function createLoyaltyPointDetails(payload: AddLoyaltyPointRequest) {
  return apiRequest("/api/v1/loyalty/loyalty_point_details", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<ApiResponse<Record<string, unknown>>>;
}

// ✅ Fetch loyalty point details for an account
export function getLoyaltyPointDetails(params: LoyaltyPointDetailsParams) {
  return apiRequest(
    `/api/v1/loyalty/loyalty_point_details/${encodeURIComponent(
      params.externalAccountId,
    )}`,
    { method: "GET" },
    {
      page: params.page ?? 0,
      pageSize: params.pageSize ?? 10,
    },
  ) as Promise<ApiResponse<Record<string, unknown>>>;
}

// ✅ Fetch account mappings
export function getAccountMappings() {
  return apiRequest("/api/v1/loyalty/account_mappings", {
    method: "GET",
  }) as Promise<ApiResponse<Record<string, unknown>>>;
}

// ✅ Fetch rule metrics
export function getRuleMetrics(from?: string, to?: string) {
  return apiRequest(
    "/internal/loyalty/metrics/rules",
    { method: "GET" },
    { ...(from && { from }), ...(to && { to }) },
  ) as Promise<ApiListResponse<RuleMetricsResponse>>;
}

// ✅ Fetch loyalty transactions
export function getLoyaltyTransactions(params: LoyaltyTransactionsParams) {
  return apiRequest(
    "/internal/loyalty/transactions",
    { method: "GET" },
    {
      ...(params.accountNumber ? { accountNumber: params.accountNumber } : {}),
      ...(params.externalAccount
        ? { externalAccount: params.externalAccount }
        : {}),
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  ) as Promise<ApiResponse<Record<string, unknown>>>;
}

// ✅ Fetch loyalty balance for an account
export function getLoyaltyBalance(
  accountNumber: string,
  externalAccount?: string,
) {
  return apiRequest(
    `/internal/loyalty/balance/${encodeURIComponent(accountNumber)}`,
    { method: "GET" },
    externalAccount ? { externalAccount } : undefined,
  ) as Promise<ApiResponse<Record<string, unknown>>>;
}
