# Cab Booking Platform

A production-grade cab booking system built as a Node.js microservices monorepo. The focus is on real distributed systems concerns: event-driven coordination, service isolation, and the architectural trade-offs that come with decomposing a booking flow into independently deployable services.

---

## Architecture Overview

```
                          ┌──────────────────┐
                          │   API Gateway    │
                          │  (JWT Validation)│
                          │  (Role Routing)  │
                          └────────┬─────────┘
                                   │ user-id / user-role headers
              ┌────────────────────┼────────────────────┐
              │                    │                    │
       ┌──────▼──────┐    ┌───────▼──────┐    ┌───────▼──────┐
       │rider-service│    │driver-service│    │ auth-service │
       └─────────────┘    └──────────────┘    └──────────────┘
              │                    │
              └────────┬───────────┘
                       │ Kafka Events
        ┌──────────────┼──────────────────────┐
        │              │                      │
┌───────▼──────┐ ┌─────▼──────┐    ┌─────────▼───────┐
│booking-saga  │ │trip-service│    │matching-service │
│  -service    │ │            │    │(Redis GeoSet)   │
└───────┬──────┘ └─────┬──────┘    └─────────────────┘
        │              │
┌───────▼──────┐ ┌─────▼──────┐
│  payment-    │ │  pricing-  │
│  service     │ │  service   │
└──────────────┘ └────────────┘
        │
┌───────▼──────┐
│notification- │
│  service     │
└──────────────┘
```

The system uses a hybrid communication model: HTTP for synchronous reads and gateway routing, Kafka for all asynchronous event coordination. The booking flow itself is orchestrated via a saga, while post-confirmation events (trip updates, notifications) use choreography.

---

## Services

| Service                | Responsibility                                                                                     | Status         |
| ---------------------- | -------------------------------------------------------------------------------------------------- | -------------- |
| `auth-service`         | Registration, login, JWT issuing, refresh/access token lifecycle, account status                   | ✅ Complete    |
| `gateway`              | JWT verification, role-based routing, header forwarding (`user-id`, `user-role`)                   | ✅ Complete    |
| `rider-service`        | Rider profile, ride history (CQRS), saved places, ratings, ride request/cancel                     | ✅ Complete    |
| `driver-service`       | Driver profile, vehicle management, availability toggle, Redis geospatial indexing, rating updates | ✅ Complete    |
| `trip-service`         | Full trip state machine, Redis live location tracking, Kafka consumers                             | ✅ Complete    |
| `matching-service`     | Redis GeoSet driver proximity search, 5 Kafka consumers, 3 Redis data structures                   | ✅ Complete    |
| `pricing-service`      | Haversine distance calculation, fare computation, pure Kafka (no HTTP, no DB)                      | ✅ Complete    |
| `booking-saga-service` | Saga orchestrator for the booking flow, step-by-step coordination with compensation                | 🔄 In Progress |
| `payment-service`      | Payment processing, Kafka integration                                                              | 🔄 In Progress |
| `notification-service` | Event-driven notifications via Kafka                                                               | 🔄 In Progress |

---

## Key Architectural Decisions

### JWT verification only at the gateway

JWT validation happens once at the gateway. Downstream services receive `user-id` and `user-role` as trusted headers and never touch the token themselves. This avoids duplicating validation logic across services and keeps auth concern centralized. The trade-off is that internal service-to-service trust is implicit, which is acceptable here given the services are not exposed externally.

### Saga orchestration for the booking flow

The booking flow (request → price → match → create trip → confirm) is orchestrated by `booking-saga-service`. Orchestration was chosen over choreography here because the booking flow has a clear sequence with compensation requirements if any step fails. Choreography is used after trip confirmation, where events fan out independently to notification, trip tracking, and billing.

### Redis geospatial for driver matching

`matching-service` uses Redis GeoSet to index available drivers by location. On a ride request event, it queries the nearest available drivers within a configurable radius. Three Redis data structures are used: GeoSet for proximity queries, a Set for availability state, and a Set per vehicle type for filtering. This keeps matching fast without a database round-trip on the hot path.

### pricing-service is stateless and Kafka-only

`pricing-service` has no HTTP endpoints and no database. It consumes fare calculation command events, computes fare using the Haversine formula, and publishes a reply event back to the saga orchestrator. Keeping it stateless makes it trivially scalable and easy to reason about.

### CQRS for ride history

`rider-service` maintains a local read copy of completed trips by consuming `trip.completed` events from Kafka. This means ride history reads never hit `trip-service`, keeping the two services fully decoupled. The trade-off is eventual consistency — history appears within seconds of trip completion, not instantly.

### node-redis over ioredis

The codebase uses `node-redis` throughout rather than mixing it with `ioredis`. The APIs are meaningfully different (connection model, command syntax, pipeline behavior) and having two Redis clients in the same codebase creates confusion and inconsistency. One client, consistently used.

### Kafka producers in dedicated modules

Kafka producers live in `src/events/producers/` rather than being called inline inside service logic. This keeps business logic clean, makes producers independently testable, and avoids the producer connection leak that comes from creating producer instances ad-hoc.

---

## Kafka Topic Map

| Topic                    | Publisher            | Consumers                                               |
| ------------------------ | -------------------- | ------------------------------------------------------- |
| `user.created`           | auth-service         | rider-service, driver-service                           |
| `ride.requested`         | rider-service        | booking-saga-service                                    |
| `ride.cancelled`         | rider-service        | booking-saga-service, trip-service                      |
| `fare.calculate.command` | booking-saga-service | pricing-service                                         |
| `fare.calculate.reply`   | pricing-service      | booking-saga-service                                    |
| `driver.find.command`    | booking-saga-service | matching-service                                        |
| `driver.find.reply`      | matching-service     | booking-saga-service                                    |
| `trip.create.command`    | booking-saga-service | trip-service                                            |
| `trip.create.reply`      | trip-service         | booking-saga-service                                    |
| `booking.confirmed`      | booking-saga-service | notification-service                                    |
| `booking.failed`         | booking-saga-service | notification-service                                    |
| `driver.online`          | driver-service       | matching-service                                        |
| `driver.offline`         | driver-service       | matching-service                                        |
| `driver.release.command` | booking-saga-service | matching-service                                        |
| `trip.started`           | trip-service         | notification-service                                    |
| `trip.completed`         | trip-service         | payment-service, rider-service, notification-service    |
| `trip.cancelled`         | trip-service         | payment-service, matching-service, notification-service |
| `payment.success`        | payment-service      | notification-service                                    |
| `payment.failed`         | payment-service      | notification-service                                    |
| `driver.rated`           | rider-service        | driver-service                                          |

---

## Monorepo Structure

```
cab-booking/
├── auth-service/
├── booking-saga-service/
├── driver-service/
├── gateway/
├── matching-service/
├── notification-service/
├── payment-service/
├── pricing-service/
├── rider-service/
├── trip-service/
├── packages/
│   ├── events/          # Shared Kafka event type definitions
│   ├── messaging/       # Kafka producer/consumer base with retry, DLQ, backoff
│   └── observability/   # Pino logger setup, structured logging
├── docker-compose.kafka-redis.yml
├── pnpm-workspace.yaml
└── package.json
```

---

## Tech Stack

| Layer           | Technology                 |
| --------------- | -------------------------- |
| Runtime         | Node.js 20+, TypeScript    |
| Framework       | Express                    |
| Database        | PostgreSQL via Drizzle ORM |
| Messaging       | Apache Kafka               |
| Cache / Geo     | Redis (`node-redis`)       |
| Logging         | Pino                       |
| Package Manager | pnpm (workspaces)          |

---

## Shared Packages

### `@cab/messaging`

Kafka consumer and producer abstractions with:

- Retry logic with jitter-based exponential backoff
- Dead letter queue (DLQ) routing on repeated failure
- JSON parsing inside try/catch to avoid crashing consumers on malformed messages
- Producer lifecycle management to prevent connection leaks

### `@cab/events`

Typed event definitions shared across services. All Kafka message shapes are defined here, so producers and consumers share a contract enforced at the type level.

### `@cab/observability`

Pino logger setup with structured JSON output. Each service imports a configured logger instance rather than setting up logging independently.

---

## Running Locally

**Prerequisites:** Node.js 20+, pnpm, Docker, PostgreSQL

```bash
# Clone the repo
git clone https://github.com/SHAMIL-VAKKAYIL/cab-booking.git
cd cab-booking

# Install dependencies
pnpm install

# Start Kafka, Zookeeper and Redis
docker-compose -f docker-compose.kafka-redis.yml up -d

# Run a specific service
pnpm --filter auth-service dev

# Run all services
pnpm dev
```

PostgreSQL is not included in the compose file. Each service expects its own database. Configure the connection string via each service's `.env` file.

Database migrations use Drizzle Kit directly:

```bash
pnpm --filter rider-service drizzle-kit migrate
```

---

## Environment Variables

Each service requires a `.env` file. Common variables across services:

```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
KAFKA_BROKERS=localhost:9092
REDIS_URL=redis://redis:6379
NODE_ENV=development
```

Additional variables per service:

```env
# auth-service only
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d
ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRES_IN=15M

# gateway only
AUTH_SERVICE_URL=http://localhost:3001
RIDER_SERVICE_URL=http://localhost:3002
DRIVER_SERVICE_URL=http://localhost:3003
TRIP_SERVICE_URL=http://localhost:3006
BOOKING_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3008
PRICING_SERVICE_URL=http://localhost:3007
NOTIFICATION_SERVICE_URL=http://localhost:3009
```

---

## Future Work

- WebSockets for real-time driver location instead of HTTP polling
- Google Maps API for accurate distance and duration calculation
- Dynamic surge pricing based on supply and demand ratio
- Driver cancellation flow with penalty logic
- Full Docker Compose setup for all services
- Kubernetes deployment manifests
- CI/CD pipeline with GitHub Actions

---

## Project Status

Active development. Core services are complete and tested. The booking saga, payment, and notification services are in progress, targeting completion in early April 2026.

This project is being built as a realistic demonstration of distributed systems patterns: saga orchestration, event-driven architecture, CQRS for read models, and geospatial indexing. It is not a tutorial project.

---

## Author

**Shamil Vakkayil**
[github.com/SHAMIL-VAKKAYIL](https://github.com/SHAMIL-VAKKAYIL)
