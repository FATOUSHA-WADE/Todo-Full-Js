export interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    photoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
}


export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data?: T[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    message?: string;
    error?: string;
}

