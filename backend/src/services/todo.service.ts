import { TodoRepository } from '../repository/todo.repository.js';
import { TodoPermissionRepository } from '../repository/todoPermission.repository.js';
import { ActivityLogService } from './activityLog.service.js';
import { ErrorMessages } from '../enums/errorEnum.js';
import { SuccessMessages } from '../enums/successEnums.js';
import type { Todo, ApiResponse, PaginatedResponse, PaginationOptions } from '../interfaces/todo.interface.js';
import { Prisma } from '../generated/prisma/index.js';

export class TodoService {
    private todoRepository: TodoRepository;
    private todoPermissionRepository: TodoPermissionRepository;
    private activityLogService: ActivityLogService;

    constructor() {
        this.todoRepository = new TodoRepository();
        this.todoPermissionRepository = new TodoPermissionRepository();
        this.activityLogService = new ActivityLogService();
    }

    async createTodo(data: Prisma.TodoCreateInput, request?: { ip?: string, get?: (header: string) => string }): Promise<ApiResponse<Todo>> {
        try {
            const todo = await this.todoRepository.create(data);

            if (typeof data.user === 'object' && 'connect' in data.user && data.user.connect?.id) {
                await this.activityLogService.logTodoAction(
                    data.user.connect.id,
                    'TODO_CREATE',
                    todo.id,
                    { title: todo.title, description: todo.description },
                    request
                );
            }

            return {
                success: true,
                data: todo,
                message: SuccessMessages.TODO_CREATED
            };
        } catch (error: any) {
            console.error('Erreur lors de la création du todo:', error);
            
            return {
                success: false,
                error: ErrorMessages.TODO_CREATION_FAILED
            };
        }
    }

    async getTodoById(id: number): Promise<ApiResponse<Todo>> {
        try {
        const todo = await this.todoRepository.findById(id);
        
        if (!todo) {
            return {
            success: false,
            error: ErrorMessages.TODO_NOT_FOUND
            };
        }

        return {
            success: true,
            data: todo,
            message: SuccessMessages.TODO_FOUND
        };
        } catch (error) {
        console.error(ErrorMessages.Error_Recuperation, error);
        return {
            success: false,
            error: ErrorMessages.DATABASE_ERROR
        };
        }
    }

    async getAllTodos(options?: {
        completed?: boolean;
        userId?: number;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Todo>> {
        try {
            const where: any = {};
            
            if (options?.completed !== undefined) {
                where.completed = options.completed;
            }
            
            if (options?.userId !== undefined) {
                where.userId = options.userId;
            }

            const whereClause = Object.keys(where).length > 0 ? where : undefined;
            
            const page = options?.page || 1;
            const limit = options?.limit || 10;
            const skip = (page - 1) * limit;
            
            const todos = await this.todoRepository.findAll({ 
                where: whereClause, 
                skip: skip, 
                take: limit 
            });
            
            const totalItems = await this.todoRepository.count(whereClause);
            const totalPages = Math.ceil(totalItems / limit);

            return {
                success: true,
                data: todos,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: totalItems,
                    itemsPerPage: limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                message: SuccessMessages.TODOS_FOUND
            };
        } catch (error) {
            console.error(ErrorMessages.Error_Recuperation, error);
            return {
                success: false,
                error: ErrorMessages.DATABASE_ERROR
            };
        }
    }

    async updateTodo(id: number, idUser: number, data: Prisma.TodoUpdateInput, request?: { ip?: string, get?: (header: string) => string }): Promise<ApiResponse<Todo>> {
        try {
            const existingTodo = await this.todoRepository.findById(id);
            if (!existingTodo) {
                return {
                success: false,
                error: ErrorMessages.TODO_NOT_FOUND
                };
            }

            const isOwner = idUser === existingTodo.userId;
            const hasEditPermission = await this.todoPermissionRepository.hasPermission(id, idUser, 'canEdit');

            if (!isOwner && !hasEditPermission) {
                return {
                    success: false,
                    error: "Vous n'avez pas la permission de modifier ce todo"
                };
            }

            const updateData: any = {};
            if (data.title !== undefined) updateData.title = data.title;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.completed !== undefined) updateData.completed = data.completed;
            if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;

            const updatedTodo = await this.todoRepository.update(id, updateData);


            const action = data.completed !== undefined ? 
                (data.completed ? 'TODO_COMPLETE' : 'TODO_INCOMPLETE') : 'TODO_UPDATE';
                
            await this.activityLogService.logTodoAction(
                idUser,
                action,
                id,
                { 
                    changes: updateData,
                    previousData: {
                        title: existingTodo.title,
                        description: existingTodo.description,
                        completed: existingTodo.completed
                    }
                },
                request
            );

            return {
                success: true,
                data: updatedTodo,
                message: SuccessMessages.TODO_UPDATED
            };
        } catch (error) {
        console.error(ErrorMessages.Error_Recuperation, error);
        return {
            success: false,
            error: ErrorMessages.TODO_UPDATE_FAILED
        };
        }
    }

    async deleteTodo(id: number, idUser: number, request?: { ip?: string, get?: (header: string) => string }): Promise<ApiResponse<Todo>> {
        try {
            const existingTodo = await this.todoRepository.findById(id);
            if (!existingTodo) {
                return {
                success: false,
                error: ErrorMessages.TODO_NOT_FOUND
                };
            }

            const isOwner = idUser === existingTodo.userId;
            const hasDeletePermission = await this.todoPermissionRepository.hasPermission(id, idUser, 'canDelete');

            if (!isOwner && !hasDeletePermission) {
                return {
                    success: false,
                    error: "Vous n'avez pas la permission de supprimer ce todo"
                };
            }

            const deletedTodo = await this.todoRepository.delete(id);

            await this.activityLogService.logTodoAction(
                idUser,
                'TODO_DELETE',
                id,
                { 
                    title: existingTodo.title,
                    description: existingTodo.description,
                    completed: existingTodo.completed
                },
                request
            );

            return {
                success: true,
                data: deletedTodo,
                message: SuccessMessages.TODO_DELETED
            };
        } catch (error) {
        console.error(ErrorMessages.Error_Recuperation, error);
        return {
            success: false,
            error: ErrorMessages.TODO_DELETE_FAILED
        };
        }
    }
}
