# Loyalty Management API

Production-ready Spring Boot service powering rule-driven loyalty earn, burn, expiry, and reversal flows.

## Quick Start

```bash
./gradlew bootRun
```

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Documentation

- Developer guide: `docs/loyalty-module.md`
- OpenAPI spec: `src/main/resources/openapi/loyalty-internal.yaml`
- Postman collection: `docs/postman/loyalty-internal.postman_collection.json`

## Testing the API

1. Import the Postman collection and set `baseUrl`, `idempotencyKey`, `correlationId` variables.
2. Call POST `/earn` to seed points, followed by POST `/burn` to validate FIFO consumption.
3. Use GET `/balance/{accountNumber}` and GET `/transactions` to confirm wallet and ledger changes.
4. Run POST `/reverse` to create compensating transactions when needed.

## Tech Stack

- Java 21, Spring Boot 3.3
- Spring Data JPA + PostgreSQL
- Liquibase migrations (see companion `loyalty-db` repo)
- MapStruct + Lombok for DTO/entity mapping

## Project Layout

```
src/main/java/com/api/wowfinstack/loyaltymanagement
├── loyalty                     # Loyalty module (domain, DTO, services, etc.)
├── config                      # Swagger/web filters
└── ...
```

## Useful Commands

- `./gradlew clean test` – build & run unit tests
- `liquibase --defaultsFile=../loyalty-db/liquibase.properties update` – apply DB changes locally
