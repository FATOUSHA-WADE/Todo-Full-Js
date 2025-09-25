import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import router from './src/routes/todo.routes.js'
import * as userRouter  from './src/routes/user.route.js';
import todoPermissionRouter from './src/routes/todoPermission.routes.js';
import photoUploadRouter from './src/routes/photoUpload.routes.js';
import activityLogRouter from './src/routes/activityLog.routes.js';
import { errorHandler, notFoundHandler,} from './src/middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3800;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors(
    {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }
));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use('/api', router);
app.use('/api', userRouter.default);
app.use('/api', todoPermissionRouter);
app.use('/api', photoUploadRouter);
app.use('/api/activity-logs', activityLogRouter);

app.get('/', (req, res) => {
res.status(200).json({
    documentation: {
        baseUrl: '/api',
        endpoints: [
            'GET /api/todo - Liste des todos',
            'POST /api/todo - Créer un todo',
            'GET /api/todo/:id - Récupérer un todo',
            'PUT /api/todo/:id - Modifier un todo',
            'DELETE /api/todo/:id - Supprimer un todo',
            
            'POST /api/users/login - Se connecter',
            'POST /api/users - Créer un utilisateur',
            'GET /api/users/:id - Récupérer un utilisateur',
            'GET /api/users - Liste des utilisateurs',
            'PUT /api/users/:id - Modifier un utilisateur',
            'DELETE /api/users/:id - Supprimer un utilisateur',
            
            'POST /api/todo-permissions - Attribuer une permission',
            'PUT /api/todo-permissions/:todoId/:userId - Modifier une permission',
            'DELETE /api/todo-permissions/:todoId/:userId - Révoquer une permission',
            'GET /api/todo-permissions/:todoId - Liste des permissions d\'une tâche',
            
            'POST /api/upload-photo - Uploader une photo (JSON base64)',
            'POST /api/upload-file - Uploader un fichier (form-data)',
            'DELETE /api/delete-photo - Supprimer une photo',
            
            'GET /api/activity-logs - Liste des logs d\'activité',
            'GET /api/activity-logs/my - Mes logs d\'activité',
            'GET /api/activity-logs/:id - Récupérer un log spécifique',
            'GET /api/activity-logs/user/:userId - Logs d\'un utilisateur',
            'DELETE /api/activity-logs/clean - Nettoyer les anciens logs (admin)'
        ]
        }
    });
});

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(PORT, () => {
            console.log(' Serveur démarré avec succès !');
            console.log(` URL: http://localhost:${PORT}`);
        });




export default app;
