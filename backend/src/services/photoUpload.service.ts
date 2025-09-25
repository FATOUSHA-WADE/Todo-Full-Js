import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryResponse {
    success: boolean;
    url?: string;
    error?: string;
}

export class PhotoUploadService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwm5zo18x',
            api_key: process.env.CLOUDINARY_API_KEY || '195369579647214',
            api_secret: process.env.CLOUDINARY_API_SECRET || 'FldR4fEHVJq313NmtHnPmz_pInA',
            secure: true
        });
    }


    async uploadPhoto(photoData: string, folder: string = 'todos'): Promise<CloudinaryResponse> {
        try {

            if (!process.env.CLOUDINARY_CLOUD_NAME && !cloudinary.config().cloud_name) {
                return {
                    success: false,
                    error: 'Configuration Cloudinary manquante. Vérifiez vos variables d\'environnement CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.'
                };
            }

            if (!photoData.startsWith('data:image/')) {
                return {
                    success: false,
                    error: 'Format d\'image invalide. L\'image doit être en base64 avec le préfixe data:image/'
                };
            }

            const result = await cloudinary.uploader.upload(photoData, {
                folder: folder,
                resource_type: 'auto',
                quality: 'auto:good',
                fetch_format: 'auto'
            });

            return {
                success: true,
                url: result.secure_url
            };

        } catch (error: any) {
            console.error('Erreur lors de l\'upload de la photo:', error);
            
            if (error.error && error.error.message) {
                return {
                    success: false,
                    error: `Erreur Cloudinary: ${error.error.message}`
                };
            }
            
            if (error.message) {
                return {
                    success: false,
                    error: `Erreur: ${error.message}`
                };
            }

            return {
                success: false,
                error: 'Erreur inconnue lors de l\'upload de la photo'
            };
        }
    }


    async deletePhoto(photoUrl: string): Promise<CloudinaryResponse> {
        try {
            if (!photoUrl || !photoUrl.includes('cloudinary.com')) {
                return {
                    success: false,
                    error: 'URL de photo Cloudinary invalide'
                };
            }

            const publicId = this.extractPublicId(photoUrl);
            if (!publicId) {
                return {
                    success: false,
                    error: 'Impossible d\'extraire l\'ID public de l\'URL'
                };
            }

            const result = await cloudinary.uploader.destroy(publicId);

            if (result.result === 'ok') {
                return {
                    success: true
                };
            } else {
                return {
                    success: false,
                    error: `Échec de la suppression: ${result.result}`
                };
            }

        } catch (error: any) {
            console.error('Erreur lors de la suppression de la photo:', error);
            return {
                success: false,
                error: 'Erreur lors de la suppression de la photo'
            };
        }
    }


    private extractPublicId(url: string): string | null {
        try {

            const matches = url.match(/\/v\d+\/(.+)$/);
            if (matches && matches[1]) {

                return matches[1].replace(/\.[^/.]+$/, '');
            }
            return null;
        } catch (error) {
            console.error('Erreur lors de l\'extraction du public_id:', error);
            return null;
        }
    }


    async uploadAudio(audioData: string, folder: string = 'todos'): Promise<CloudinaryResponse> {
        try {
            if (!audioData.startsWith('data:audio/')) {
                return {
                    success: false,
                    error: 'Format audio invalide. Le fichier doit être en base64 avec le préfixe data:audio/'
                };
            }

            const result = await cloudinary.uploader.upload(audioData, {
                folder: folder,
                resource_type: 'video', // Cloudinary traite l'audio comme "video"
                quality: 'auto:good',
                fetch_format: 'auto'
            });

            return {
                success: true,
                url: result.secure_url
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Erreur inconnue lors de l\'upload audio'
            };
        }
    }
}
