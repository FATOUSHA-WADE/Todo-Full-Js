import { Request, Response } from 'express';
import { ActivityLogService } from '../services/activityLog.service.js';
import type { ActivityLogFilters } from '../interfaces/activityLog.interface.js';

export class ActivityLogController {
    private activityLogService: ActivityLogService;

    constructor() {
        this.activityLogService = new ActivityLogService();
    }

    async getActivityLogs(req: Request, res: Response): Promise<void> {
        try {
            const {
                userId,
                action,
                entity,
                entityId,
                dateFrom,
                dateTo,
                page,
                limit
            } = req.query;

            const filters: ActivityLogFilters = {};

            if (userId) filters.userId = parseInt(userId as string);
            if (action) filters.action = action as string;
            if (entity) filters.entity = entity as string;
            if (entityId) filters.entityId = parseInt(entityId as string);
            if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
            if (dateTo) filters.dateTo = new Date(dateTo as string);
            if (page) filters.page = parseInt(page as string);
            if (limit) filters.limit = parseInt(limit as string);

            const result = await this.activityLogService.getActivityLogs(filters);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Erreur dans getActivityLogs:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    }

    async getLogById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const logId = parseInt(id);

            if (isNaN(logId)) {
                res.status(400).json({
                    success: false,
                    error: 'ID du log invalide'
                });
                return;
            }

            const result = await this.activityLogService.getLogById(logId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Erreur dans getLogById:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    }

    async getUserActivityLogs(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { limit } = req.query;
            
            const userIdNumber = parseInt(userId);
            const limitNumber = limit ? parseInt(limit as string) : undefined;

            if (isNaN(userIdNumber)) {
                res.status(400).json({
                    success: false,
                    error: 'ID utilisateur invalide'
                });
                return;
            }

            const result = await this.activityLogService.getUserActivityLogs(userIdNumber, limitNumber);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Erreur dans getUserActivityLogs:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    }

    async getMyActivityLogs(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const { limit } = req.query;
            
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }

            const limitNumber = limit ? parseInt(limit as string) : undefined;
            const result = await this.activityLogService.getUserActivityLogs(userId, limitNumber);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Erreur dans getMyActivityLogs:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    }

    async cleanOldLogs(req: Request, res: Response): Promise<void> {
        try {
            const { days } = req.query;
            const daysNumber = days ? parseInt(days as string) : 90;


            const userRole = (req as any).user?.role;
            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: 'Droits administrateur requis'
                });
                return;
            }

            const result = await this.activityLogService.cleanOldLogs(daysNumber);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Erreur dans cleanOldLogs:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    }
}
