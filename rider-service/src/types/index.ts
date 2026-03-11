export interface InitialRiderData {
  email: string;
  userId: string;
}

export interface RiderProfile {
  name: string;
  userId: string;
  phone: string;
}

export interface CreateRideHistoryInput {
  riderId: string;
  tripId: string;
  driverId: string;
  pickupAddress: string;
  dropoffAddress: string;
  fare: string;
  distanceKm?: string;
  durationMins?: number;
  status: 'COMPLETED' | 'CANCELLED';
  vehicleType?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface consumerMessage {
  key: string | null;
  value: CreateRideHistoryInput;
  partition: number;
  offset: string;
}

export interface CreateRatingInput {
  riderId: string;
  driverId: string;
  tripId: string;
  score: number;
  comment?: string;
}

export interface CreateSavedPlaceInput {
  riderId: string;
  label: 'HOME' | 'WORK' | 'OTHER';
  alias?: string;
  address: string;
  latitude: number;
  longitude: number;
}
