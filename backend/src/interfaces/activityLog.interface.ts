export interface ActivityLog {
    id: number;
    userId: number;
    action: string;
    entity: string;
    entityId?: number | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    user?: {
        id: number;
        name: string | null;
        email: string;
    };
}

export interface CreateActivityLogInput {
    userId: number;
    action: string;
    entity: string;
    entityId?: number;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
}

export interface ActivityLogFilters {
    userId?: number;
    action?: string;
    entity?: string;
    entityId?: number;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
}

export interface PaginatedActivityLogs {
    success: boolean;
    data?: ActivityLog[];
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

export interface ApiResponseActivityLog<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export enum ActivityActions {

    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    REGISTER = 'REGISTER',
    

    TODO_CREATE = 'TODO_CREATE',
    TODO_UPDATE = 'TODO_UPDATE',
    TODO_DELETE = 'TODO_DELETE',
    TODO_COMPLETE = 'TODO_COMPLETE',
    TODO_INCOMPLETE = 'TODO_INCOMPLETE',
    

    PERMISSION_GRANT = 'PERMISSION_GRANT',
    PERMISSION_REVOKE = 'PERMISSION_REVOKE',
    

    USER_CREATE = 'USER_CREATE',
    USER_UPDATE = 'USER_UPDATE',
    USER_DELETE = 'USER_DELETE',
    

    PHOTO_UPLOAD = 'PHOTO_UPLOAD',
    PHOTO_DELETE = 'PHOTO_DELETE'
}

export enum ActivityEntities {
    TODO = 'TODO',
    USER = 'USER',
    PERMISSION = 'PERMISSION',
    AUTH = 'AUTH',
    PHOTO = 'PHOTO'
}
