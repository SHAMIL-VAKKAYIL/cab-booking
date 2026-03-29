export const config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET!,
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    driver: process.env.DRIVER_SERVICE_URL || 'http://localhost:4002',
    rider: process.env.RIDER_SERVICE_URL || 'http://localhost:4003',
    trip: process.env.TRIP_SERVICE_URL || 'http://localhost:4004',
    booking: process.env.BOOKING_SERVICE_URL || 'http://localhost:4005',
    pricing: process.env.PRICING_SERVICE_URL || 'http://localhost:4006',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:4007',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4008',
    matching: process.env.MATCHING_SERVICE_URL || 'http://localhost:4009',

  }
}