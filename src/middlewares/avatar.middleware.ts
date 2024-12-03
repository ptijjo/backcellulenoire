/* eslint-disable prettier/prettier */
import multer from 'multer';
import { Request } from 'express';
import { join } from 'path';

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};


// Configuration de multer avec un filtre pour n'accepter que les fichiers image
const storage = multer.diskStorage({
  destination: (req: Request, file,callBack) => {
    const uploadPath = join(__dirname, '..', '..', 'public', 'avatar');
    console.log(uploadPath)
    callBack(null, uploadPath);
  },

  filename: (req:any, file, callBack) => {
      const user = req.auth.userId.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callBack(null,user + Date.now()+ '.' + extension);
  },
});

// Fonction de filtre pour accepter uniquement les fichiers images
const fileFilter = (req: Request, file, cb) => {
    
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true); // Accepter le fichier
    } else {
      cb(new Error('Seuls les fichiers image (JPEG,JPG, PNG, GIF)  sont autorisés'), false); // Rejeter le fichier
    }
  };

const uploadAvatar = multer({ storage: storage, fileFilter: fileFilter }).single('avatar');

export default uploadAvatar;
