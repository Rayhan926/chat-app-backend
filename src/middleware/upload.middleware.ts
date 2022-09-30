import { Request } from 'express';
import fs from 'fs';
import createHttpError from 'http-errors';
import multer from 'multer';
import path from 'path';

const uploadFolderPath = './public';
const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    console.log('path', fs.existsSync(uploadFolderPath));
    if (!fs.existsSync(uploadFolderPath)) {
      fs.mkdirSync(path.join(uploadFolderPath));
      cb(null, uploadFolderPath);
    } else {
      cb(null, uploadFolderPath);
    }
  },
  filename: (req: Request, file: any, cb: any) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `${file.originalname
      .replace(fileExt, '')
      .toLowerCase()
      .split(' ')
      .join('-')}-${Date.now()}`;

    cb(null, fileName + fileExt);
  },
});

const upload = multer({
  storage,
  limits: {
    fieldSize: 1000000,
  },
  fileFilter: (req: Request, file: any, cb: any) => {
    const acceptedMimeTypes = ['image/jpg', 'image/png', 'image/jpeg'];
    if (acceptedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(createHttpError(401, 'File type is not accepted'));
    }
  },
});
export default upload;
