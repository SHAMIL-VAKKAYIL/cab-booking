export const config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET!,
  },
  services: {
    auth:         process.env.AUTH_SERVICE_URL         || 'http://localhost:3001',
    driver:       process.env.DRIVER_SERVICE_URL       || 'http://localhost:3002',
    rider:        process.env.RIDER_SERVICE_URL        || 'http://localhost:3003',
    trip:         process.env.TRIP_SERVICE_URL         || 'http://localhost:3006',
    booking:      process.env.BOOKING_SERVICE_URL      || 'http://localhost:3005',
    payment:      process.env.PAYMENT_SERVICE_URL      || 'http://localhost:3008',
    pricing:      process.env.PRICING_SERVICE_URL      || 'http://localhost:3007',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3009',
  }
}