import { ActivityLogRepository } from '../repository/activityLog.repository.js';
import { ErrorMessages } from '../enums/errorEnum.js';
import { SuccessMessages } from '../enums/successEnums.js';
import type { 
    ActivityLog, 
    CreateActivityLogInput, 
    ActivityLogFilters, 
    PaginatedActivityLogs, 
    ApiResponseActivityLog,
    ActivityActions,
    ActivityEntities
} from '../interfaces/activityLog.interface.js';

export class ActivityLogService {
    private activityLogRepository: ActivityLogRepository;

    constructor() {
        this.activityLogRepository = new ActivityLogRepository();
    }

    async createLog(data: CreateActivityLogInput): Promise<ApiResponseActivityLog<ActivityLog>> {
        try {
            const log = await this.activityLogRepository.create(data);

            return {
                success: true,
                data: log,
                message: 'Log d\'activité créé avec succès'
            };
        } catch (error: any) {
            console.error('Erreur lors de la création du log d\'activité:', error);
            
            return {
                success: false,
                error: 'Échec de la création du log d\'activité'
            };
        }
    }

    async getActivityLogs(filters: ActivityLogFilters): Promise<PaginatedActivityLogs> {
        try {
            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const skip = (page - 1) * limit;
            
            const logs = await this.activityLogRepository.findAll({ 
                ...filters, 
                skip: skip, 
                take: limit 
            });
            
            const totalItems = await this.activityLogRepository.count(filters);
            const totalPages = Math.ceil(totalItems / limit);

            return {
                success: true,
                data: logs,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: totalItems,
                    itemsPerPage: limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                message: 'Logs d\'activité récupérés avec succès'
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des logs d\'activité:', error);
            return {
                success: false,
                error: 'Erreur lors de la récupération des logs d\'activité'
            };
        }
    }

    async getLogById(id: number): Promise<ApiResponseActivityLog<ActivityLog>> {
        try {
            const log = await this.activityLogRepository.findById(id);
            
            if (!log) {
                return {
                    success: false,
                    error: 'Log d\'activité non trouvé'
                };
            }

            return {
                success: true,
                data: log,
                message: 'Log d\'activité trouvé'
            };
        } catch (error) {
            console.error('Erreur lors de la récupération du log d\'activité:', error);
            return {
                success: false,
                error: 'Erreur de base de données'
            };
        }
    }

    async getUserActivityLogs(userId: number, limit?: number): Promise<ApiResponseActivityLog<ActivityLog[]>> {
        try {
            const logs = await this.activityLogRepository.findByUserId(userId, limit);

            return {
                success: true,
                data: logs,
                message: 'Logs d\'activité de l\'utilisateur récupérés avec succès'
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des logs d\'activité de l\'utilisateur:', error);
            return {
                success: false,
                error: 'Erreur lors de la récupération des logs d\'activité de l\'utilisateur'
            };
        }
    }

    async cleanOldLogs(daysOld: number = 90): Promise<ApiResponseActivityLog<{ deletedCount: number }>> {
        try {
            const deletedCount = await this.activityLogRepository.deleteOldLogs(daysOld);

            return {
                success: true,
                data: { deletedCount },
                message: `${deletedCount} anciens logs d'activité supprimés`
            };
        } catch (error) {
            console.error('Erreur lors de la suppression des anciens logs:', error);
            return {
                success: false,
                error: 'Erreur lors de la suppression des anciens logs'
            };
        }
    }

    async logTodoAction(
        userId: number, 
        action: string, 
        todoId: number, 
        details?: any, 
        request?: { ip?: string, get?: (header: string) => string }
    ): Promise<void> {
        const logData: CreateActivityLogInput = {
            userId,
            action,
            entity: 'TODO',
            entityId: todoId,
            details,
            ipAddress: request?.ip,
            userAgent: request?.get?.('User-Agent')
        };

        await this.createLog(logData);
    }

    async logUserAction(
        userId: number, 
        action: string, 
        targetUserId?: number, 
        details?: any, 
        request?: { ip?: string, get?: (header: string) => string }
    ): Promise<void> {
        const logData: CreateActivityLogInput = {
            userId,
            action,
            entity: 'USER',
            entityId: targetUserId,
            details,
            ipAddress: request?.ip,
            userAgent: request?.get?.('User-Agent')
        };

        await this.createLog(logData);
    }

    async logAuthAction(
        userId: number, 
        action: string, 
        details?: any, 
        request?: { ip?: string, get?: (header: string) => string }
    ): Promise<void> {
        const logData: CreateActivityLogInput = {
            userId,
            action,
            entity: 'AUTH',
            details,
            ipAddress: request?.ip,
            userAgent: request?.get?.('User-Agent')
        };

        await this.createLog(logData);
    }

    async logPermissionAction(
        userId: number, 
        action: string, 
        todoId: number, 
        targetUserId: number, 
        details?: any, 
        request?: { ip?: string, get?: (header: string) => string }
    ): Promise<void> {
        const logData: CreateActivityLogInput = {
            userId,
            action,
            entity: 'PERMISSION',
            entityId: todoId,
            details: {
                ...details,
                targetUserId
            },
            ipAddress: request?.ip,
            userAgent: request?.get?.('User-Agent')
        };

        await this.createLog(logData);
    }
}
