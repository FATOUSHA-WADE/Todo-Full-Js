import { userSchema } from '../schemaValidator/user.validator';
import { AuthService } from '../services/auth.service';
import { UserService } from "../services/user.service";
import { Request, Response } from 'express';

export class UserController{
    private service: UserService
    private authService :AuthService;
        constructor() {
            this.service = new UserService();
            this.authService = new AuthService();
        }

        async createUser(req: Request, res: Response)
        {
                try {
                        const user = userSchema.parse(req.body);

                        const result = await this.service.createUser(user);

                        res.status(201).json({
                            success: true,
                            message: 'Utilisateur créé avec succès',
                            data: result
                        });
                    }
                catch (error: any) {
                        console.error('Erreur lors de la création de l\'utilisateur:', error);
                        
                        if (error.name === 'ZodError') {
                            return res.status(400).json({ 
                                success: false,
                                error: 'Données de validation invalides',
                                details: error.issues 
                            });
                        }
                        
                        if (error.name === 'PrismaClientValidationError') {
                            return res.status(400).json({ 
                                success: false,
                                error: 'Erreur de validation des données',
                                message: 'Les données fournies ne correspondent pas au schéma de base de données'
                            });
                        }
                        
                        if (error.code === 'P2002') {
                            return res.status(409).json({ 
                                success: false,
                                error: 'Email déjà utilisé',
                                message: 'Un utilisateur avec cet email existe déjà'
                            });
                        }
                        
                        res.status(500).json({ 
                            success: false,
                            error: 'Erreur interne du serveur'
                        });
                }

        }

        async login(req: Request, res: Response)
        {
                const { email, password } = req.body;
                if (!email || !password) {
                        return res.status(400).json({ error: 'Email and password are required' });
                }

                try {
                        const token = await this.authService.login({email, password});
                        res.status(200).json({
                            success: true,
                            message: 'Authentication successful',
                            token
                        });
                    } catch (error) {
                        res.status(401).json({ error: 'Invalid email or password' });
                    }
        }

        async refreshToken(req: Request, res: Response)
        {
                const { refreshToken } = req.body;
                if (!refreshToken) {
                        return res.status(400).json({ 
                            success: false,
                            error: 'Refresh token is required' 
                        });
                }

                try {
                        const result = await this.authService.refreshToken({refreshToken});
                        res.status(200).json({
                            success: true,
                            message: 'Token refreshed successfully',
                            accessToken: result.accessToken
                        });
                    } catch (error) {
                        res.status(401).json({ 
                            success: false,
                            error: 'Invalid refresh token' 
                        });
                    }
        }

        async getUserById(req: Request, res: Response)
        {
                const id = parseInt(req.params.id, 10);
                if (isNaN(id)) {
                        return res.status(400).json({ error: 'Invalid user ID' });
                }

                try {
                        const user = await this.service.getUserById(id);
                        if (user) {
                                res.status(200).json({
                                    success: true,
                                    data: user
                                });
                        } else {
                                res.status(404).json({ error: 'User not found' });
                        }
                } catch (error) {
                        res.status(500).json({ error: 'Internal Server Error' });
                }
        }

        async getAllUsers(req: Request, res: Response)
        {
                try {
                        const users = await this.service.getAllUsers();
                        res.status(200).json({
                            success: true,
                            data: users
                        });
                    } catch (error) {
                        res.status(500).json({ error: 'Internal Server Error' });
                    }
        }

        async updateUser(req: Request, res: Response)
        {
                const id = parseInt(req.params.id, 10);
                if (isNaN(id)) {
                        return res.status(400).json({ error: 'Invalid user ID' });
                }

                const { email, name } = req.body;
                if (!email && !name) {
                        return res.status(400).json({ error: 'No data provided for update' });
                }

                try {
                        const updatedUser = await this.service.updateUser(id, { email, name });
                        res.status(200).json({
                            success: true,
                            message: 'User updated successfully',
                            data: updatedUser
                        });
                    } catch (error) {
                        res.status(500).json({ error: 'Internal Server Error' });
                    }
        }

        async deleteUser(req: Request, res: Response)
        {
                const id = parseInt(req.params.id, 10);
                if (isNaN(id)) {
                        return res.status(400).json({ error: 'Invalid user ID' });
                }

                try {
                        const deletedUser = await this.service.deleteUser(id);
                        res.status(200).json({
                            success: true,
                            message: 'User deleted successfully',
                            data: deletedUser
                        });
                    } catch (error) {
                        res.status(500).json({ error: 'Internal Server Error' });
                    }
        }
}