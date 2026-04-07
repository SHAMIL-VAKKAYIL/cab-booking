export interface CreatePaymentInput {
  tripId: string;
  riderId: string;
  riderEmail: string;
  driverId: string;
  amount: number;
  currency?: string;
}

export interface RefundPaymentInput {
  tripId:  string
  reason:  string
}
