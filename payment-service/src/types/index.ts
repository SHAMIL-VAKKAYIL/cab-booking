export interface CreatePaymentInput {
  tripId: string;
  riderId: string;
  driverId: string;
  amount: number;
  currency?: string;
}

export interface ProcessPaymentInput {
  paymentId: string;
  tripId: string;
  riderId: string;
  driverId: string;
  amount: number;
}

export interface RefundPaymentInput {
  tripId:  string
  reason:  string
}
