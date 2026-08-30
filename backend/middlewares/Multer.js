import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'product_images', 
    allowed_formats: ['jpeg', 'jpg', 'png', 'jfif', 'gif'], // Allowed file formats
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0], // Unique file name
  },
});

const upload = multer({ storage });

export default upload;




