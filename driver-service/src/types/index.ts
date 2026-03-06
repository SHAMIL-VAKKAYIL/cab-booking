export interface InitialDriverData {
    email: string
    userId: string;
}

export interface DriverProfile {
    name: string;
    licenseNumber: string;
    licenseExpiry: Date;
    vehicleModel: string;
    vehiclePlate: string;
    userId: string;
}