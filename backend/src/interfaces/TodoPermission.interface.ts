export interface TodoPermission {
    id: number;
    todoId: number;
    userId: number;
    canEdit: boolean;
    canDelete: boolean;
    createdAt: Date;
}

export interface CreateTodoPermissionInput {
    todoId: number;
    userId: number;
    canEdit: boolean;
    canDelete: boolean;
}

export interface UpdateTodoPermissionInput {
    canEdit?: boolean;
    canDelete?: boolean;
}

export interface TodoPermissionResponse {
    success: boolean;
    data?: TodoPermission;
    message?: string;
    error?: string;
}
