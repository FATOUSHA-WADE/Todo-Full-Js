import { PrismaClient } from '../generated/prisma/index.js';
import { CreateTodoPermissionInput, UpdateTodoPermissionInput, TodoPermission } from '../interfaces/TodoPermission.interface.js';

export class TodoPermissionRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(data: CreateTodoPermissionInput): Promise<TodoPermission> {
        return this.prisma.todoPermission.create({ data });
    }

    async findByTodoAndUser(todoId: number, userId: number): Promise<TodoPermission | null> {
        return this.prisma.todoPermission.findUnique({
            where: {
                todoId_userId: {
                    todoId,
                    userId
                }
            }
        });
    }

    async findByTodo(todoId: number): Promise<TodoPermission[]> {
        return this.prisma.todoPermission.findMany({
            where: { todoId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                }
            }
        });
    }

    async update(todoId: number, userId: number, data: UpdateTodoPermissionInput): Promise<TodoPermission> {
        return this.prisma.todoPermission.update({
            where: {
                todoId_userId: {
                    todoId,
                    userId
                }
            },
            data
        });
    }

    async delete(todoId: number, userId: number): Promise<TodoPermission> {
        return this.prisma.todoPermission.delete({
            where: {
                todoId_userId: {
                    todoId,
                    userId
                }
            }
        });
    }

    async hasPermission(todoId: number, userId: number, permission: 'canEdit' | 'canDelete'): Promise<boolean> {
        const todoPermission = await this.findByTodoAndUser(todoId, userId);
        if (!todoPermission) return false;
        return todoPermission[permission];
    }
}
