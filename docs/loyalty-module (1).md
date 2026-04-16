# Loyalty Module Developer Guide

## Overview
The loyalty module provides an internal-only REST API under `/internal/loyalty` that exposes wallet, rule and ledger capabilities. The API follows a controller → service → repository layering, persists business data via Liquibase-managed tables, and emits responses inside a common `ApiResponse<T>` envelope.

- **Headers**: every POST must include `Idempotency-Key`; all endpoints accept optional `X-Correlation-Id` which flows through MDC and structured logs.
- **Responses**: success payloads return `{ code, message, data, timestamp }`; errors reuse the same envelope with a domain-specific code.
- **Idempotency**: POST /earn and POST /burn deduplicate requests by `(loyaltyAccountId, Idempotency-Key)` pair. Duplicate calls replay the cached `ApiResponse`.
- **Logging**: log entries include correlation id, wallet id, rule id, points delta, and idempotency status.

## API Surface

| Method | Path | Description | Idempotent | Notes |
| --- | --- | --- | --- | --- |
| POST | `/earn` | Run rule engine and credit points into FIFO buckets | Yes (Idempotency-Key) | Requires account context + transaction metadata |
| POST | `/burn` | Consume available buckets FIFO and debit wallet | Yes (Idempotency-Key) | Rejects if insufficient balance |
| GET | `/balance/{accountNumber}` | Fetch wallet balance snapshot | N/A | Optional `externalAccount` query for disambiguation |
| GET | `/transactions` | Page through immutable ledger | N/A | Query params: `accountNumber`, optional `externalAccount`, `page`, `size` |
| POST | `/reverse` | Reverse an earn or burn transaction | No | Creates compensating ledger rows |
| GET | `/rules` | List configured loyalty rules | N/A | Filter client-side for specific event types |
| POST | `/rules` | Create/update rule definitions | No | Provide full rule payload; server enforces versioning |
| GET | `/idempotency` | Inspect cached idempotent response | N/A | Params: `accountNumber`, optional `externalAccount`, `idempotencyKey` |

Refer to `src/main/resources/openapi/loyalty-internal.yaml` for the canonical OpenAPI 3 specification.

## Request / Response Shapes

- **EarnPointsRequest**
  ```json
  {
    "accountNumber": "ACCT-123",
    "externalAccount": "EXT-45",
    "eventType": "POS_PURCHASE",
    "transactionAmount": 1200.50,
    "referenceId": "ORD-789",
    "channel": "MOBILE_APP",
    "partnerId": "PARTNER-01",
    "attributes": {
      "merchantCategory": "ELEC",
      "city": "Kathmandu"
    }
  }
  ```
- **ApiResponse<EarnPointsResponse>**
  ```json
  {
    "code": "LOY-200",
    "message": "Points earned",
    "data": {
      "transactionId": 10234,
      "pointsEarned": 600,
      "balanceAfter": 4800,
      "bucketIds": [5511, 5512]
    },
    "timestamp": "2026-04-03T09:45:21.312Z"
  }
  ```

Additional schemas (`BurnPointsRequest`, `LoyaltyRuleRequest`, etc.) are outlined inside the OpenAPI document.

### Reward Types

- `FIXED`: grants exactly `rewardValue` points whenever the rule matches.
- `MULTIPLIER`: multiplies `transactionAmount` by `multiplier` (or `rewardValue` if `multiplier` is null) to compute points.
- `PERCENTAGE`: interprets `rewardValue` as a percentage (e.g., `5` = 5%) and awards that percent of the transaction amount.
- `TIERED`: see the section below for chunked vs. slabbed tier options.

### Tiered Reward Payloads

When a rule uses `rewardType = TIERED`, there are two supported strategies:

1. **Fixed-size tiers (legacy)** – set `minEventValue` to the chunk size (e.g., 100). Every full chunk earns `rewardValue` points; partial chunks are ignored.
2. **Bracketed slabs (recommended)** – embed a `tiers` array inside `rewardPayload`, where each object defines `minAmount`, optional `maxAmount` (exclusive), and `points`. The engine chooses the first bracket whose range matches the transaction amount.

Example rule payload enabling slabs:

```json
{
  "rewardType": "TIERED",
  "rewardPayload": {
    "tiers": [
      { "minAmount": 0, "maxAmount": 100, "points": 10 },
      { "minAmount": 100, "maxAmount": 200, "points": 15 },
      { "minAmount": 200, "points": 25 }
    ]
  }
}
```

With the above configuration a ₹150 purchase falls into the `100-200` bracket and earns 15 points, while any amount ≥ ₹200 returns 25 points. If `tiers` is omitted, the legacy chunked calculation remains in effect for backwards compatibility.

### Partner Scoping, Caps & Blackouts

- Set `partnerId` on both `LoyaltyRuleRequest` and runtime earn calls; only matching partner rules will evaluate (rules without a partner remain global).
- For throttling, use `maxPointsDaily` / `maxPointsWeekly` / `maxPointsMonthly` to cap total points minted per rule within rolling 1/7/30 day windows. Exceeding a cap throws `RuleValidationException`.
- Provide `blackoutFrom`/`blackoutTo` to temporarily disable a rule without changing its status; the earn flow skips rules whose blackout window currently applies.

## Swagger / OpenAPI

1. The static specification lives at `src/main/resources/openapi/loyalty-internal.yaml` and documents headers, payloads, and response envelopes.
2. Once controllers are wired, springdoc automatically serves live docs at `/swagger-ui/index.html` and `/v3/api-docs`.
3. Keep this schema in sync with controller contracts; update via PR when endpoints evolve.

## Postman Collection

- Import `docs/postman/loyalty-internal.postman_collection.json` into Postman.
- Set the following variables (collection level):
  - `baseUrl`: e.g., `http://localhost:8080/internal/loyalty`
  - `idempotencyKey`: UUID per earn/burn invocation
  - `correlationId`: optional UUID for tracing
- Each request already contains representative payloads and headers to accelerate testing.

## Testing Workflow

1. **Earn flow**: call POST `/earn` with Idempotency-Key, inspect response for ledger ids and bucket IDs.
2. **Burn flow**: call POST `/burn` with previously earned account; verify FIFO consumption in response metadata.
3. **Balance snapshot**: GET `/balance/{accountNumber}` to ensure `balanceAfter` matches wallet state.
4. **Ledger review**: GET `/transactions?accountNumber=...` to confirm audit trail with pagination.
5. **Reversal**: POST `/reverse` referencing the original transaction id; ensure compensating ledger entry appears.

## Operational Notes

- **Correlation**: propagate `X-Correlation-Id` from upstream services into API requests so logs can be stitched across systems.
- **Idempotency cache**: POST responses are stored on the originating transaction metadata row and replayed for re-tries until a housekeeping job truncates them; there is no automatic TTL today.
- **Error Codes**: `LOY-001` (insufficient points), `LOY-002` (duplicate), `LOY-003` (rule missing), `LOY-004` (account missing), `LOY-005` (invalid rule), `LOY-999` (generic failure).
- **Expiry Handling**: `LoyaltyExpiryScheduler` runs every 5 minutes (configurable via `loyalty.expiry.job.*`) and sweeps `ACTIVE`/`PARTIALLY_CONSUMED` buckets whose `expires_at` is in the past. Each sweep marks buckets `EXPIRED`, zeroes `points_remaining`, decrements wallet balance, bumps `lifetime_expired`, and persists a ledger `EXPIRY` transaction with the affected bucket snapshot.
- **Expiring Soon Alerts**: `LoyaltyExpiringSoonScheduler` (driven by `loyalty.expiry.notification.*`) scans upcoming expiries (default 30 & 7 day windows), logs `EXPIRING_SOON` audit events per account, and populates the `/balance` response `expiringSoon` map so channels can surface countdown messaging.
- **Operational Observability**: Spring Boot Actuator is enabled with `/actuator/health`, `/actuator/info`, `/actuator/metrics`, and `/actuator/prometheus`. The custom `loyaltyExpiry` health indicator fails readiness if overdue buckets exceed the configured threshold (`loyalty.monitoring.expiry.*`).
- **Rule Analytics**: GET `/internal/loyalty/metrics/rules?from=&to=` aggregates bucket-level stats per rule (points issued, remaining, expired, bucket count) within the requested window; defaults to the last 30 days when parameters are omitted.
- **Cap Metrics**: The `LoyaltyRuleCapMetricsPublisher` emits Micrometer gauges (`loyalty_rule_cap_usage_ratio`, `loyalty_rule_cap_usage_points`) per rule/partner for daily, weekly, and monthly windows. Tune via `loyalty.monitoring.cap-metrics.*` and scrape `/actuator/prometheus` for visibility.
- **Cap Alerts**: When a rule consumes ≥ `loyalty.monitoring.cap-metrics.alert-threshold` of its configured cap, an alert payload is published via Kafka (topic `loyalty-cap-alerts`, overridable via `loyalty.alerts.cap.*`) alongside optional INFO logs.
- **Reconciliation Job**: `LoyaltyReconciliationScheduler` (default 02:00 daily, controlled by `loyalty.reconciliation.*`) compares wallet balances, bucket residuals, and ledger deltas. Variances beyond the tolerance emit logs and Micrometer gauges (`loyalty_reconcile_variance_*`) for monitoring.
- **Idempotency Store**: Successful earn/burn responses are stored in `loyalty_idempotency` for 7 days (`loyalty.idempotency.*`). Use GET `/internal/loyalty/idempotency?accountNumber=&externalAccount=&idempotencyKey=` to inspect cached payloads when troubleshooting retries.

## Future Hooks

- Add `/internal/loyalty/accounts` administration endpoints if wallet provisioning is required externally.
- Extend rule payload schema to support partner-level caps and time-of-day conditions.
- Integrate alerting that fires when burn attempts fail due to low balance or when expiries exceed configured thresholds.
