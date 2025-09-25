import { PrismaClient } from '../generated/prisma/index.js';
import type { ActivityLog, CreateActivityLogInput, ActivityLogFilters } from '../interfaces/activityLog.interface.js';

export class ActivityLogRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(data: CreateActivityLogInput): Promise<ActivityLog> {
        return this.prisma.activityLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId || null,
                details: data.details ? JSON.stringify(data.details) : null,
                ipAddress: data.ipAddress || null,
                userAgent: data.userAgent || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async findAll(filters: ActivityLogFilters & { skip?: number; take?: number }) {
        const where: any = {};

        if (filters.userId) {
            where.userId = filters.userId;
        }

        if (filters.action) {
            where.action = filters.action;
        }

        if (filters.entity) {
            where.entity = filters.entity;
        }

        if (filters.entityId) {
            where.entityId = filters.entityId;
        }

        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.createdAt.lte = filters.dateTo;
            }
        }

        return this.prisma.activityLog.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
            skip: filters.skip,
            take: filters.take,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async count(filters: ActivityLogFilters): Promise<number> {
        const where: any = {};

        if (filters.userId) {
            where.userId = filters.userId;
        }

        if (filters.action) {
            where.action = filters.action;
        }

        if (filters.entity) {
            where.entity = filters.entity;
        }

        if (filters.entityId) {
            where.entityId = filters.entityId;
        }

        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.createdAt.lte = filters.dateTo;
            }
        }

        return this.prisma.activityLog.count({
            where: Object.keys(where).length > 0 ? where : undefined
        });
    }

    async findById(id: number): Promise<ActivityLog | null> {
        return this.prisma.activityLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async findByUserId(userId: number, limit?: number): Promise<ActivityLog[]> {
        return this.prisma.activityLog.findMany({
            where: { userId },
            take: limit,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async deleteOldLogs(daysOld: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await this.prisma.activityLog.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate
                }
            }
        });

        return result.count;
    }
}
