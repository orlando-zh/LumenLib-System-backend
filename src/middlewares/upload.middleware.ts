import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Aseguramos que la carpeta exista
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Genera nombre único: libro-TIMESTAMP-RANDOM.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'libro-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Validar que sea imagen
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, webp)'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite 5MB
});