export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        email: string;
        name: string|null;
        role: string;
    };
}

export interface RefreshRequest {
    refreshToken: string;
}

export interface RefreshResponse {
    accessToken: string;
}

export interface JWTPayload {
    userId: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
