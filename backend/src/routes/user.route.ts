import { Router } from 'express';
import { UserController } from '../controller/user.controller';
import { AuthMiddleware } from '../middleware/auth';
import { AuthService } from '../services/auth.service';

const { authenticate, writeAccess, adminOnly } = new AuthMiddleware(new AuthService());

const router = Router();
const userController = new UserController();

router.post('/users/login', (req, res) => userController.login(req, res));
router.post('/users/refresh-token', (req, res) => userController.refreshToken(req, res));
router.post('/users', (req, res) => userController.createUser(req, res));


router.get('/users/:id', authenticate, (req, res) => userController.getUserById(req, res));
router.get('/users', authenticate, adminOnly, (req, res) => userController.getAllUsers(req, res));
router.put('/users/:id', authenticate, (req, res) => userController.updateUser(req, res));
router.delete('/users/:id', authenticate, adminOnly, (req, res) => userController.deleteUser(req, res));

export default router;
