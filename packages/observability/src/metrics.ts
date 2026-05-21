import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client'

// create a single registry for the entire service
export const registry = new Registry()

// collect default metrics — CPU, memory, event loop lag etc.
// completely automatic, zero extra code needed

collectDefaultMetrics({ register: registry })

// ─── HTTP Metrics (all services) ─────────────────────────────────

export const httpRequestTotal = new Counter({
  name:       'http_requests_total',
  help:       'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers:  [registry]
})

export const httpRequestDuration = new Histogram({
  name:       'http_request_duration_seconds',
  help:       'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets:    [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
  registers:  [registry]
})

// ─── Kafka Metrics (all services) ────────────────────────────────

export const kafkaMessagesConsumed = new Counter({
  name:       'kafka_messages_consumed_total',
  help:       'Total Kafka messages consumed',
  labelNames: ['topic', 'group_id', 'status'],  // status: success | failed | dlq
  registers:  [registry]
})

export const kafkaMessageDuration = new Histogram({
  name:       'kafka_message_processing_duration_seconds',
  help:       'Duration of Kafka message processing',
  labelNames: ['topic'],
  buckets:    [0.01, 0.05, 0.1, 0.5, 1, 3, 5],
  registers:  [registry]
})

// ─── Business Metrics (used selectively per service) ─────────────

// booking-saga-service
export const sagaStartedTotal = new Counter({
  name:      'saga_started_total',
  help:      'Total sagas started',
  registers: [registry]
})

export const sagaConfirmedTotal = new Counter({
  name:      'saga_confirmed_total',
  help:      'Total sagas confirmed successfully',
  registers: [registry]
})

export const sagaFailedTotal = new Counter({
  name:       'saga_failed_total',
  help:       'Total sagas failed',
  labelNames: ['reason'],
  registers:  [registry]
})

export const sagaDuration = new Histogram({
  name:      'saga_duration_seconds',
  help:      'Time from saga start to confirmation',
  buckets:   [1, 2, 5, 10, 20, 30],
  registers: [registry]
})

// trip-service
export const activeTrips = new Gauge({
  name:      'active_trips',
  help:      'Number of currently active trips',
  registers: [registry]
})

export const tripCompletedTotal = new Counter({
  name:      'trip_completed_total',
  help:      'Total trips completed',
  registers: [registry]
})

export const tripCancelledTotal = new Counter({
  name:       'trip_cancelled_total',
  help:       'Total trips cancelled',
  labelNames: ['cancelled_by'],
  registers:  [registry]
})

// payment-service
export const paymentSuccessTotal = new Counter({
  name:      'payment_success_total',
  help:      'Total successful payments',
  registers: [registry]
})

export const paymentFailedTotal = new Counter({
  name:      'payment_failed_total',
  help:      'Total failed payments',
  registers: [registry]
})

export const paymentAmount = new Histogram({
  name:      'payment_amount_inr',
  help:      'Distribution of payment amounts in INR',
  buckets:   [50, 100, 200, 500, 1000, 2000],
  registers: [registry]
})

// matching-service
export const driverMatchAttempts = new Counter({
  name:      'driver_match_attempts_total',
  help:      'Total driver match attempts',
  registers: [registry]
})

export const driverMatchSuccess = new Counter({
  name:      'driver_match_success_total',
  help:      'Total successful driver matches',
  registers: [registry]
})

export const driverMatchFailed = new Counter({
  name:      'driver_match_failed_total',
  help:      'Total failed driver matches',
  registers: [registry]
})

// rider-service
export const rideRequestsTotal = new Counter({
  name:      'ride_requests_total',
  help:      'Total ride requests made',
  registers: [registry]
})