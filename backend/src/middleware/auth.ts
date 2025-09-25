import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ValidationError } from '../errors/AppError';


declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
                role: string;
            };
        }
    }
}

export class AuthMiddleware {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }


    authenticate = (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new ValidationError('Token d\'authentification requis');
            }

            const token = authHeader.substring(7);
            const decoded = this.authService.verifyAccessToken(token);


            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };

            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Token d\'authentification invalide',
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    };


    authorize = (allowedRoles: string[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                if (!req.user) {
                    throw new ValidationError('Utilisateur non authentifié');
                }

                if (!allowedRoles.includes(req.user.role)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès refusé. Permissions insuffisantes.'
                    });
                }

                next();
            } catch (error) {
                res.status(403).json({
                    success: false,
                    message: 'Accès refusé',
                    error: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
    };


    adminOnly = this.authorize(['ADMIN']);
    writeAccess = this.authorize(['ADMIN','USER']);
}
