import { Request, Response, NextFunction } from 'express';
import { ErrorMessages } from '../enums/errorEnum.js';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    res.status(404).json({
        success: false,
        error: 'Endpoint non trouvé',
        message: `La route ${req.method} ${req.path} n'existe pas`
    });
    };

export const errorHandler = (error: Error,req: Request,res: Response,next: NextFunction): void => {
    console.error('Erreur globale:', error);

    if (error.message.includes('Prisma')) {
        res.status(500).json({
        success: false,
        error: ErrorMessages.DATABASE_ERROR,
        message: 'Erreur de base de données'
        });
        return;
    }

    if (error instanceof SyntaxError && 'body' in error) {
        res.status(400).json({
        success: false,
        error: ErrorMessages.VALIDATION_ERROR,
        message: 'JSON invalide dans le body de la requête'
        });
        return;
    }

    res.status(500).json({
        success: false,
        error: ErrorMessages.SERVER_ERROR,
        message: 'Une erreur interne est survenue'
    });
};

