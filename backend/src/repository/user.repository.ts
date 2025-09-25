import { PrismaClient } from '../generated/prisma/index.js';
import { User } from '../interfaces/user.interface.js';

type UserCreateInput = {
    email: string;
    password: string;
    name?: string | null;
    role?: string;
};

type UserUpdateInput = {
    email?: string;
    name?: string | null;
};

export class UserRepository {
    private prisma: PrismaClient
    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(data: UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async findById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany({
            orderBy: { id: 'desc' }
        });
    }

    async update(id: number, data: UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data
        });
    }

    async delete(id: number): Promise<User> {
        return this.prisma.user.delete({
            where: { id }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }
}