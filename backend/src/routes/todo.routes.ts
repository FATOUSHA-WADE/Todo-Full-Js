import { Router } from 'express';
import { TodoController } from '../controller/todo.controller.js';
import { AuthMiddleware } from '../middleware/auth.js';
import { AuthService } from '../services/auth.service.js';

const { authenticate, writeAccess } = new AuthMiddleware(new AuthService());


const router = Router();
const todoController = new TodoController();

router.get('/todo', todoController.getAllTodos);
router.get('/todo/:id', todoController.getTodoById);

router.post('/todo', authenticate, writeAccess, todoController.createTodo);
router.put('/todo/:id', authenticate, writeAccess, todoController.updateTodo);
router.delete('/todo/:id', authenticate, writeAccess, todoController.deleteTodo);

export default router;
