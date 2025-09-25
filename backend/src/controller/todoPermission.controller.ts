import { Request, Response } from 'express';
import { TodoPermissionService } from '../services/todoPermission.service';
import { z } from 'zod';


const assignPermissionSchema = z.object({
    todoId: z.number().int().positive(),
    userId: z.number().int().positive(),
    canEdit: z.boolean(),
    canDelete: z.boolean()
});

const assignPermissionByLoginSchema = z.object({
    todoId: z.number().int().positive(),
    userLogin: z.string().min(1, 'Le login ne peut pas être vide'),
    canEdit: z.boolean(),
    canDelete: z.boolean()
});

const updatePermissionSchema = z.object({
    canEdit: z.boolean().optional(),
    canDelete: z.boolean().optional()
});

const permissionParamsSchema = z.object({
    todoId: z.string().regex(/^\d+$/, 'ID invalide').transform(val => parseInt(val, 10)),
    userId: z.string().regex(/^\d+$/, 'ID invalide').transform(val => parseInt(val, 10))
});

export class TodoPermissionController {
    private todoPermissionService: TodoPermissionService;

    constructor() {
        this.todoPermissionService = new TodoPermissionService();
    }

    assignPermission = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }

            const validatedData = assignPermissionSchema.parse(req.body);
            const result = await this.todoPermissionService.assignPermission(validatedData, req.user.userId);

            if (result.success) {
                res.status(201).json(result);
            } else {
                const statusCode = result.error?.includes('permission') ? 403 : 
                                result.error?.includes('trouvée') ? 404 : 400;
                res.status(statusCode).json(result);
            }
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    error: 'Données de validation invalides',
                    details: error.issues
                });
                return;
            }

            console.error('Erreur dans assignPermission:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    };

    assignPermissionByLogin = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }

            const validatedData = assignPermissionByLoginSchema.parse(req.body);
            const result = await this.todoPermissionService.assignPermissionByLogin(validatedData, req.user.userId);

            if (result.success) {
                res.status(201).json(result);
            } else {
                const statusCode = result.error?.includes('permission') ? 403 : 
                                result.error?.includes('trouvé') ? 404 : 400;
                res.status(statusCode).json(result);
            }
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    error: 'Données de validation invalides',
                    details: error.issues
                });
                return;
            }

            console.error('Erreur dans assignPermissionByLogin:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    };

    updatePermission = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }

            const paramsValidation = permissionParamsSchema.parse(req.params);
            const bodyValidation = updatePermissionSchema.parse(req.body);

            const result = await this.todoPermissionService.updatePermission(
                paramsValidation.todoId,
                paramsValidation.userId,
                bodyValidation,
                req.user.userId
            );

            if (result.success) {
                res.status(200).json(result);
            } else {
                const statusCode = result.error?.includes('permission') ? 403 : 
                                result.error?.includes('trouvée') ? 404 : 400;
                res.status(statusCode).json(result);
            }
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    error: 'Données de validation invalides',
                    details: error.issues
                });
                return;
            }

            console.error('Erreur dans updatePermission:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    };

    revokePermission = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }

            const paramsValidation = permissionParamsSchema.parse(req.params);
            const result = await this.todoPermissionService.revokePermission(
                paramsValidation.todoId,
                paramsValidation.userId,
                req.user.userId
            );

            if (result.success) {
                res.status(200).json(result);
            } else {
                const statusCode = result.error?.includes('permission') ? 403 : 
                                result.error?.includes('trouvée') ? 404 : 400;
                res.status(statusCode).json(result);
            }
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    error: 'Données de validation invalides',
                    details: error.issues
                });
                return;
            }

            console.error('Erreur dans revokePermission:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    };

    getPermissions = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }

            const todoId = parseInt(req.params.todoId, 10);
            if (isNaN(todoId)) {
                res.status(400).json({
                    success: false,
                    error: 'ID de tâche invalide'
                });
                return;
            }

            const result = await this.todoPermissionService.getPermissions(todoId, req.user.userId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const statusCode = result.error?.includes('permission') ? 403 : 
                                result.error?.includes('trouvée') ? 404 : 400;
                res.status(statusCode).json(result);
            }
        } catch (error) {
            console.error('Erreur dans getPermissions:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    };
}
