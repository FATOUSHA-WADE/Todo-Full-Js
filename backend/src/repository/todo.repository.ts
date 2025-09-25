import { PrismaClient, Prisma } from '../generated/prisma/index.js';
import type { Todo } from '../interfaces/todo.interface.js';


export class TodoRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(data: Prisma.TodoCreateInput): Promise<Todo> {
        return await this.prisma.todo.create({data});
    }

    async findById(id: number): Promise<Todo | null> {
        return await this.prisma.todo.findUnique({
            where: { id },
            include: {
                user: true,
                permissions: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    async findAll(options?: {
        where?: Prisma.TodoWhereInput;
        skip?: number;
        take?: number;
    }): Promise<Todo[]> {
        return await this.prisma.todo.findMany({
            where: options?.where,
            skip: options?.skip,
            take: options?.take,
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
                permissions: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    async count(where?: Prisma.TodoWhereInput): Promise<number> {
        return await this.prisma.todo.count({where});
    }

    async update(id: number, data: Prisma.TodoUpdateInput): Promise<Todo> {
        return await this.prisma.todo.update({
        where: { id },
        data
        });
    }

    async delete(id: number): Promise<Todo> {
        return await this.prisma.todo.delete({
        where: { id }
        });
    }
    }
