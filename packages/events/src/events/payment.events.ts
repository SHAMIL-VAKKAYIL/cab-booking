export interface PaymentSuccessEvent {
  event: "PAYMENT_SUCCESS";
  data: {
    paymentId: string;
    tripId: string;
    riderId: string;
    riderEmail: string;
    driverId: string;
    amount: number;
    currency: string;
    transactionId: string;
    occurredAt: string;
  };
  metadata: {
    correlationId: string;
    source: string;
    version: number;
  };
}

export interface PaymentFailedEvent {
  event: "PAYMENT_FAILED";
  data: {
    paymentId: string;
    tripId: string;
    riderId: string;
    riderEmail: string;
    reason: string;
    occurredAt: string;
  };
  metadata: {
    correlationId: string;
    source: string;
    version: number;
  };
}
