import { Router } from 'express';
import { ActivityLogController } from '../controller/activityLog.controller.js';
import { AuthMiddleware } from '../middleware/auth.js';
import { AuthService } from '../services/auth.service.js';

const router = Router();
const activityLogController = new ActivityLogController();
const authService = new AuthService();
const authMiddleware = new AuthMiddleware(authService);

router.use(authMiddleware.authenticate);

router.get('/', activityLogController.getActivityLogs.bind(activityLogController));

router.get('/my', activityLogController.getMyActivityLogs.bind(activityLogController));

router.get('/:id', activityLogController.getLogById.bind(activityLogController));

router.get('/user/:userId', activityLogController.getUserActivityLogs.bind(activityLogController));

router.delete('/clean', authMiddleware.adminOnly, activityLogController.cleanOldLogs.bind(activityLogController));

export default router;
