import { Request, Response } from 'express';
import { PhotoUploadService } from '../services/photoUpload.service';
import { uploadPhotoSchema, deletePhotoSchema } from '../schemaValidator/photo.validator';

export class PhotoUploadController {
    private photoUploadService: PhotoUploadService;

    constructor() {
        this.photoUploadService = new PhotoUploadService();
    }

    uploadPhoto = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }

            let fileData: string;
            let folder: string = 'todos';

            if (req.file) {
                fileData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
                folder = req.body.folder || 'todos';
            } else if (req.body.photoData) {
                const validatedData = uploadPhotoSchema.parse(req.body);
                fileData = validatedData.photoData;
                folder = validatedData.folder;
            } else {
                res.status(400).json({
                    success: false,
                    error: 'Aucun fichier fourni. Utilisez soit "photoData" (JSON) soit "file" (form-data)'
                });
                return;
            }

            let result;
            if (req.file && req.file.mimetype.startsWith('audio/')) {
                result = await this.photoUploadService.uploadAudio(fileData, folder);
            } else {
                result = await this.photoUploadService.uploadPhoto(fileData, folder);
            }

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Fichier uploadé avec succès',
                    data: {
                        url: result.url
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    error: 'Données de validation invalides',
                    details: error.issues
                });
                return;
            }

            console.error('Erreur dans uploadPhoto:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    };

    deletePhoto = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }

            const validatedData = deletePhotoSchema.parse(req.body);
            const result = await this.photoUploadService.deletePhoto(validatedData.photoUrl);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Photo supprimée avec succès'
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    error: 'Données de validation invalides',
                    details: error.issues
                });
                return;
            }
            console.error('Erreur dans deletePhoto:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    };


    uploadFile = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
                return;
            }

            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: 'Aucun fichier fourni'
                });
                return;
            }

            const folder = req.body.folder || 'todos';
            const mimetype = req.file.mimetype;

            // Génére le bon préfixe base64
            const base64String = `data:${mimetype};base64,${req.file.buffer.toString('base64')}`;

            let result;
            if (mimetype.startsWith('image/')) {
                result = await this.photoUploadService.uploadPhoto(base64String, folder);
            } else if (mimetype.startsWith('audio/')) {
                // Ajoute une méthode uploadAudio dans ton service si besoin, ou réutilise uploadPhoto si compatible
                result = await this.photoUploadService.uploadAudio
                    ? await this.photoUploadService.uploadAudio(base64String, folder)
                    : await this.photoUploadService.uploadPhoto(base64String, folder);
            } else {
                res.status(400).json({
                    success: false,
                    error: 'Format de fichier non supporté (image ou audio uniquement)'
                });
                return;
            }

            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    url: result.url
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error || 'Erreur lors de l\'upload'
                });
            }
        } catch (error) {
            console.error('Erreur dans uploadFile:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }
    };

}
