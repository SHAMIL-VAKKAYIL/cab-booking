export interface RegisterRequest {
    email: string
    password: string
    role?: string
}

export interface LoginRequest {
    email: string
    password: string
}
