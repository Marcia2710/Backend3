import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CustomError } from '../errors/CustomError.js';
import { ERROR_DICTIONARY } from '../errors/errorDictionary.js';
import { DOCUMENT_TYPES } from '../constants/index.js';
import { logger } from './logger.config.js';

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subFolder = 'general';

    if (req.originalUrl.includes('/deliveries')) {
      subFolder = 'deliveries';
    } else if (req.body?.documentType === DOCUMENT_TYPES.LICENSE) {
      subFolder = 'licenses';
    } else if (req.originalUrl.includes('/users')) {
      subFolder = 'users';
    }

    const uploadPath = path.join(process.cwd(), 'uploads', subFolder);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    logger.warning(`Intento de subida con formato no permitido: ${file.mimetype} (${file.originalname})`);
    return cb(new CustomError(ERROR_DICTIONARY.INVALID_FILE_TYPE), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});
