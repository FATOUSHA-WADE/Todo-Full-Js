import { Request, Response } from 'express';
import { TodoService } from '../services/todo.service';
import { ErrorMessages } from '../enums/errorEnum.js';
import { createTodoSchema, updateTodoSchema, todoParamsSchema,completedFilterSchema} from '../schemaValidator/todo.validator';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../interfaces/IAuth';

export class TodoController {
        private todoService: TodoService;

        constructor() {
                this.todoService = new TodoService();
        }

        createTodo = async (req: Request, res: Response): Promise<void> => {
                try {
                        const validatedData = createTodoSchema.parse(req.body);

                        const { userId, ...rest } = validatedData;
                        const todoCreateInput = {
                                ...rest,
                                user: {
                                        connect: { id: userId }
                                }
                        };
                        
                        const result = await this.todoService.createTodo(todoCreateInput);
                        
                        if (result.success) {
                                res.status(201).json(result);
                        } else {
                                res.status(400).json(result);
                        }
                } catch (error: any) {
                        if (error.name === 'ZodError') {
                                res.status(400).json({
                                        success: false,
                                        error: ErrorMessages.VALIDATION_ERROR,
                                        details: error.issues
                                });
                                return;
                        }
                        console.error('Erreur dans createTodo:', error);
                        res.status(500).json({
                                success: false,
                                error: ErrorMessages.SERVER_ERROR
                        });
                }
        };

        getTodoById = async (req: Request, res: Response): Promise<void> => {
                try {
                        const validatedParams = todoParamsSchema.parse(req.params);

                        const result = await this.todoService.getTodoById(validatedParams.id);
                        
                        if (result.success) {
                                res.status(200).json(result);
                        } else {
                                res.status(404).json(result);
                        }
                } catch (error: any) {
                        if (error.name === 'ZodError') {
                                res.status(400).json({
                                        success: false,
                                        error: ErrorMessages.INVALID_TODO_ID,
                                        details: error.issues
                                });
                                return;
                        }
                        console.error('Erreur dans getTodoById:', error);
                        res.status(500).json({
                                success: false,
                                error: ErrorMessages.SERVER_ERROR
                        });
                }
        };

        getAllTodos = async (req: Request, res: Response): Promise<void> => {
                try {
                        const validatedQuery = completedFilterSchema.parse(req.query);

                        const { completed, userId, page, limit } = validatedQuery;
                    
                        const filterOptions: { completed?: boolean; userId?: number; page?: number; limit?: number } = {};
                        if (completed !== undefined) {
                                filterOptions.completed = completed;
                        }
                        if (userId !== undefined) {
                                filterOptions.userId = userId;
                        }
                        if (page !== undefined) {
                                filterOptions.page = page;
                        }
                        if (limit !== undefined) {
                                filterOptions.limit = limit;
                        }
                        
                        const result = await this.todoService.getAllTodos(filterOptions);
                        if (result.success) {
                                res.status(200).json(result);
                        } else {
                                res.status(400).json(result);
                        }
                } catch (error: any) {
                        if (error.name === 'ZodError') {
                                res.status(400).json({
                                        success: false,
                                        error: ErrorMessages.VALIDATION_ERROR,
                                        details: error.issues
                                });
                                return;
                        }
                        console.error('Erreur dans getAllTodos:', error);
                        res.status(500).json({
                                success: false,
                                error: ErrorMessages.SERVER_ERROR
                        });
                }
        };

        updateTodo = async (req: Request, res: Response): Promise<void> => {
                try {
                        const paramsValidation = todoParamsSchema.safeParse(req.params);
                        const bodyValidation = updateTodoSchema.safeParse(req.body);
                        
                        const authorise = req.headers.authorization;
                        const token = authorise?.split(' ')[1];
                        const verifier = jwt.verify(token!, process.env.JWT_ACCESS_SECRET || 'fatousha') as JWTPayload;
                        const idUser = verifier.userId;

                        if (!paramsValidation.success) {
                                res.status(400).json({
                                        success: false,
                                        error: ErrorMessages.INVALID_TODO_ID,
                                        details: paramsValidation.error.issues
                                });
                                return;
                        }

                        if (!bodyValidation.success) {
                                res.status(400).json({
                                        success: false,
                                        error: ErrorMessages.VALIDATION_ERROR,
                                        details: bodyValidation.error.issues
                                });
                                return;
                        }

                        const result = await this.todoService.updateTodo(
                                paramsValidation.data.id,
                                idUser,
                                bodyValidation.data
                        );
                        
                        if (result.success) {
                                res.status(200).json(result);
                        } else {
                                res.status(404).json(result);
                        }
                } catch (error) {
                        console.error('Erreur dans updateTodo:', error);
                        res.status(500).json({
                                success: false,
                                error: ErrorMessages.SERVER_ERROR
                        });
                }
        };
        

        deleteTodo = async (req: Request, res: Response): Promise<void> => {
                try {
                        const validationResult = todoParamsSchema.safeParse(req.params);

                        const authorise = req.headers.authorization;
                        const token = authorise?.split(' ')[1];
                        const verifier = jwt.verify(token!, process.env.JWT_ACCESS_SECRET || 'fatousha') as JWTPayload;
                        const idUser = verifier.userId;

                        if (!validationResult.success) {
                                res.status(400).json({
                                        success: false,
                                        error: ErrorMessages.INVALID_TODO_ID,
                                        details: validationResult.error.issues
                                });
                                return;
                        }

                        const result = await this.todoService.deleteTodo(validationResult.data.id, idUser);

                        if (result.success) {
                                res.status(200).json(result);
                        } else {
                                res.status(404).json(result);
                        }
                } catch (error) {
                        console.error('Erreur dans deleteTodo:', error);
                        res.status(500).json({
                                success: false,
                                error: ErrorMessages.SERVER_ERROR
                        });
                }
        };

}
