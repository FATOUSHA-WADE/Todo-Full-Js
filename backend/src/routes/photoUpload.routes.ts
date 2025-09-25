import { Router } from 'express';
import { PhotoUploadController } from '../controller/photoUpload.controller';
import { AuthMiddleware } from '../middleware/auth';
import { AuthService } from '../services/auth.service';
import { singleFileUpload } from '../middleware/upload.middleware';

const { authenticate, writeAccess } = new AuthMiddleware(new AuthService());

const router = Router();
const photoUploadController = new PhotoUploadController();

router.use(authenticate);

router.post('/upload-photo', writeAccess, photoUploadController.uploadPhoto);

router.post('/upload-file', writeAccess, singleFileUpload, photoUploadController.uploadFile);

router.delete('/delete-photo', writeAccess, photoUploadController.deletePhoto);

export default router;
