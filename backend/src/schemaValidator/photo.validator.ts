import { z } from 'zod';

export const uploadPhotoSchema = z.object({
    photoData: z.string()
        .min(1, 'Photo requise')
        .refine(
            (data) => data.startsWith('data:image/'), 
            'Format invalide. La photo doit être en base64 avec le préfixe data:image/'
        ),
    folder: z.string()
        .min(1, 'Le nom du dossier ne peut pas être vide')
        .max(50, 'Le nom du dossier ne peut pas dépasser 50 caractères')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom du dossier ne peut contenir que des lettres, chiffres, tirets et underscores')
        .optional()
        .default('todos')
});


export const deletePhotoSchema = z.object({
    photoUrl: z.string()
        .url('URL invalide')
        .refine(
            (url) => url.includes('cloudinary.com') || url.includes('res.cloudinary.com'), 
            'Seules les URLs Cloudinary sont acceptées'
        )
});


export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>;
export type DeletePhotoInput = z.infer<typeof deletePhotoSchema>;
