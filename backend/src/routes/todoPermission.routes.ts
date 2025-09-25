import { Router } from 'express';
import { TodoPermissionController } from '../controller/todoPermission.controller';
import { AuthMiddleware } from '../middleware/auth';
import { AuthService } from '../services/auth.service';

const { authenticate, writeAccess } = new AuthMiddleware(new AuthService());

const router = Router();
const todoPermissionController = new TodoPermissionController();

router.use(authenticate);

router.post('/todo-permissions', writeAccess, todoPermissionController.assignPermission);

// Nouvelle route pour assigner une permission par login
router.post('/todo-permissions/by-login', writeAccess, todoPermissionController.assignPermissionByLogin);

router.put('/todo-permissions/:todoId/:userId', writeAccess, todoPermissionController.updatePermission);

router.delete('/todo-permissions/:todoId/:userId', writeAccess, todoPermissionController.revokePermission);

router.get('/todo-permissions/:todoId', todoPermissionController.getPermissions);

export default router;
