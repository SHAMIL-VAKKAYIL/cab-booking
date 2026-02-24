export interface UserCreatedEvent {
    event: string;
    data: {
        userId: string;
        email: string;
        role: 'rider' | 'driver';
        occurredAt: string;
    }
    metadata: {
        correlationId: string
        version: number
        source: string
    }
}
